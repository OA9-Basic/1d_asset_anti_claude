import { NextRequest, NextResponse } from 'next/server';

import { signToken, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * Sign in endpoint with rate limiting
 * SECURITY: 5 attempts per 15 minutes per IP address
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limiting based on IP address
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`signin:${ip}`, RateLimitPresets.auth);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many sign-in attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.firstName,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );

    // Set cookie with 7 day expiration to match token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

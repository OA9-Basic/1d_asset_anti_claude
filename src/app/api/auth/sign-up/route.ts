import { NextRequest, NextResponse } from 'next/server';

import { hashPassword, signToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { createLogger, logError } from '@/lib/logger';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { generateVerificationToken } from '@/lib/verification';

const logger = createLogger('auth:sign-up');

/**
 * Sign up endpoint with rate limiting and email verification
 * SECURITY: 5 attempts per 15 minutes per IP address
 */
export async function POST(req: NextRequest) {
  // SECURITY: Rate limiting based on IP address
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  try {
    const rateLimit = checkRateLimit(`signup:${ip}`, RateLimitPresets.auth);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many sign-up attempts. Please try again later.',
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
    const { email, password, name } = body;

    // SECURITY: Basic input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // SECURITY: Password strength check
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName: name,
        emailVerified: false, // Require email verification
        wallet: {
          create: {},
        },
      },
    });

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(email, 'email');
    await sendVerificationEmail(email, verificationToken);

    logger.info({ userId: user.id, email }, 'User created, verification email sent');

    const token = signToken(user.id);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.firstName,
          emailVerified: false,
        },
        message: 'Account created. Please check your email to verify your account.',
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
    logError(error, 'sign_up_failed', { ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

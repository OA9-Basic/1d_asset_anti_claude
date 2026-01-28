import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { createLogger, logError } from '@/lib/logger';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { generateVerificationToken } from '@/lib/verification';

const logger = createLogger('auth:resend-verification');

/**
 * Resend verification email endpoint
 * POST /api/auth/resend-verification
 */
export async function POST(req: NextRequest) {
  try {
    // Get user ID from token
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user data
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(`resend-verification:${userId}`, RateLimitPresets.auth);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token and send email
    const verificationToken = await generateVerificationToken(user.email, 'email');
    await sendVerificationEmail(user.email, verificationToken);

    logger.info({ userId: user.id, email: user.email }, 'Verification email resent');

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    logError(error, 'resend_verification_failed');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

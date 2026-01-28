import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { createLogger, logError } from '@/lib/logger';
import { verifyToken } from '@/lib/verification';

const logger = createLogger('auth:verify-email');

/**
 * Verify email endpoint
 * GET /api/auth/verify-email?token=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify token and get email
    const email = await verifyToken(token, 'email');

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    logger.info({ userId: user.id, email }, 'Email verified successfully');

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logError(error, 'email_verification_failed');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

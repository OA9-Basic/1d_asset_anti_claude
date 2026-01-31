import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { contributeToAsset } from '@/lib/contribution';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { db } from '@/lib/db';

const contributeSchema = z.object({
  assetId: z.string().cuid(),
  amount: z
    .string()
    .or(z.number())
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num < 1) throw new Error('Amount must be at least $1');
      return num;
    }),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check email verification
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required',
          message: 'Please verify your email address before contributing. Check your inbox for the verification link.',
          requireVerification: true,
        },
        { status: 403 }
      );
    }

    // Rate limiting for contributions
    const rateLimit = checkRateLimit(`contribution:${userId}`, RateLimitPresets.contribution);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many contribution attempts',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { assetId, amount } = contributeSchema.parse(body);

    const result = await contributeToAsset(userId, assetId, amount);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      assetId: result.assetId,
      amount: result.amount,
      excessAmount: result.excessAmount,
      isFullyFunded: result.isFullyFunded,
      remainingNeeded: result.remainingNeeded,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Contribution error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

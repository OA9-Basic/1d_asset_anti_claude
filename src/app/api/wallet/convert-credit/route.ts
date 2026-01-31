import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentLogger } from '@/lib/loggers';
import {
  isPrismaDecimalLessThan,
  subtractPrismaDecimals,
  addPrismaDecimals,
  prismaDecimalToNumber,
} from '@/lib/prisma-decimal';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';

const convertSchema = z.object({
  amount: z
    .string()
    .or(z.number())
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num <= 0) throw new Error('Amount must be positive');
      return num;
    }),
});

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let body: { amount?: unknown } | undefined;

  try {
    userId = await getUserFromToken(req);

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
          message: 'Please verify your email address before converting credits. Check your inbox for the verification link.',
          requireVerification: true,
        },
        { status: 403 }
      );
    }

    // Rate limiting for store credit conversion
    const rateLimit = checkRateLimit(`convert-credit:${userId}`, RateLimitPresets.financial);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many conversion attempts',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    body = await req.json();
    const { amount } = convertSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: userId ?? '' },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check withdrawable balance
      if (isPrismaDecimalLessThan(wallet.withdrawableBalance, amount)) {
        throw new Error(
          `Insufficient withdrawable balance. Available: $${prismaDecimalToNumber(wallet.withdrawableBalance).toFixed(2)}`
        );
      }

      const withdrawableBefore = wallet.withdrawableBalance;
      const creditBefore = wallet.storeCredit;
      const withdrawableAfter = subtractPrismaDecimals(withdrawableBefore, amount);
      const creditAfter = addPrismaDecimals(creditBefore, amount);

      // Create transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'STORE_CREDIT_CONVERSION',
          status: 'COMPLETED',
          amount: amount,
          balanceBefore: withdrawableBefore,
          balanceAfter: withdrawableAfter,
          description: `Converted $${amount.toFixed(2)} to store credit`,
          metadata: {
            creditBefore,
            creditAfter,
          },
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          withdrawableBalance: withdrawableAfter,
          storeCredit: creditAfter,
          totalConvertedToCredit: addPrismaDecimals(wallet.totalConvertedToCredit, amount),
        },
      });

      return {
        withdrawableBefore,
        withdrawableAfter,
        creditBefore,
        creditAfter,
      };
    });

    return NextResponse.json({
      success: true,
      amount,
      withdrawableBalance: result.withdrawableAfter,
      storeCredit: result.creditAfter,
      message: `Converted $${amount.toFixed(2)} to store credit`,
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

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('insufficient')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    paymentLogger.error('Store credit conversion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      amount: body?.amount,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

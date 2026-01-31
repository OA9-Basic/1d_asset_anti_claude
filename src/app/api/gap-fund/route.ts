import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentLogger } from '@/lib/loggers';
import {
  subtractPrismaDecimals,
  isPrismaDecimalLessThanOrEqual,
  addPrismaDecimals,
  prismaDecimalToNumber
} from '@/lib/prisma-decimal';

const gapFundSchema = z.object({
  assetId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let body: { assetId?: string } | undefined;

  try {
    userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    body = await req.json();
    const { assetId } = gapFundSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId ?? '' },
        include: { wallet: true },
      }) as { id: string; wallet: { id: string; balance: Prisma.Decimal | string | number } } | null;

      if (!user?.wallet) {
        throw new Error('Wallet not found');
      }

      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      if (asset.status !== 'COLLECTING') {
        throw new Error('Asset is not accepting gap funding');
      }

      const gap = subtractPrismaDecimals(asset.targetPrice, asset.currentCollected);

      if (isPrismaDecimalLessThanOrEqual(gap, 0)) {
        throw new Error('Asset is already fully funded');
      }

      const userBalance = prismaDecimalToNumber(user.wallet.balance);
      const gapAmount = prismaDecimalToNumber(gap);
      if (userBalance < gapAmount) {
        throw new Error('Insufficient balance for gap funding');
      }

      const existingLoan = await tx.gapLoan.findFirst({
        where: {
          userId: user.id,
          assetId: assetId,
        },
      });

      if (existingLoan) {
        throw new Error('Gap loan already exists for this asset');
      }

      const balanceBefore = user.wallet.balance;
      const balanceAfter = subtractPrismaDecimals(balanceBefore, gap);

      const debitTransaction = await tx.transaction.create({
        data: {
          walletId: user.wallet.id,
          userId: user.id,
          type: 'GAP_LOAN_DISBURSEMENT',
          status: 'COMPLETED',
          amount: gap,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          referenceId: assetId,
          referenceType: 'GAP_LOAN',
          description: `Gap funding for asset: ${asset.title}`,
        },
      });

      await tx.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: balanceAfter },
      });

      const newCollected = addPrismaDecimals(asset.currentCollected, gap);

      const gapLoan = await tx.gapLoan.create({
        data: {
          userId: user.id,
          assetId: assetId,
          loanAmount: gap,
          repaidAmount: 0,
          remainingAmount: gap,
          status: 'ACTIVE',
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          currentCollected: newCollected,
          status: 'PURCHASED',
          purchasedAt: new Date(),
        },
      });

      return {
        gapLoan,
        debitTransaction,
        updatedAsset,
        gapAmount: gap,
        newBalance: balanceAfter,
      };
    });

    return NextResponse.json(
      {
        loanId: result.gapLoan.id,
        transactionId: result.debitTransaction.id,
        gapAmount: result.gapAmount,
        assetStatus: result.updatedAsset.status,
        newBalance: result.newBalance,
      },
      { status: 201 }
    );
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
      if (message.includes('not found') || message.includes('wallet')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (
        message.includes('not accepting') ||
        message.includes('already funded') ||
        message.includes('already exists')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    paymentLogger.error('Gap fund failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      assetId: body?.assetId,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

// SECURITY FIX: MOCK mode only allowed in development
const IS_DEV = process.env.NODE_ENV === 'development';

const depositSchema = z.object({
  amount: z
    .string()
    .or(z.number())
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num <= 0) throw new Error('Invalid amount');
      return num;
    }),
  cryptoCurrency: z.enum([
    'BTC',
    'ETH',
    'USDT',
    'USDC',
    'XMR',
    'LTC',
    'BCH',
    ...(IS_DEV ? ['MOCK' as const] : []),
  ]),
  txHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, cryptoCurrency, txHash } = depositSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // SECURITY FIX: Only allow MOCK deposits in development environment
      if (cryptoCurrency === 'MOCK' && !IS_DEV) {
        throw new Error('Mock deposits are only allowed in development mode');
      }

      const description =
        cryptoCurrency === 'MOCK'
          ? 'Test deposit (Development mode only)'
          : `Crypto deposit (${cryptoCurrency})`;

      // SECURITY FIX: For non-MOCK deposits, require transaction hash verification
      if (cryptoCurrency !== 'MOCK' && !txHash) {
        throw new Error('Transaction hash is required for crypto deposits');
      }

      // TODO: Add blockchain verification for actual crypto deposits
      // This is a placeholder - in production you would verify the txHash on the blockchain

      if (!user.wallet) {
        const newWallet = await tx.wallet.create({
          data: {
            userId: user.id,
            balance: amount,
            totalDeposited: amount,
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            walletId: newWallet.id,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: amount,
            balanceBefore: 0,
            balanceAfter: amount,
            description,
            metadata: {
              cryptoCurrency,
              txHash,
            },
          },
        });

        return {
          balance: newWallet.balance,
          transaction,
        };
      }

      const balanceBefore = user.wallet.balance;
      const balanceAfter = balanceBefore + amount;

      const transaction = await tx.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          description,
          metadata: {
            cryptoCurrency,
            txHash,
          },
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: balanceAfter,
          totalDeposited: { increment: amount },
        },
      });

      return {
        balance: updatedWallet.balance,
        transaction,
      };
    });

    return NextResponse.json({
      success: true,
      balance: result.balance,
      transactionId: result.transaction.id,
      message:
        cryptoCurrency === 'MOCK'
          ? `Test deposit of $${amount.toFixed(2)} added (development mode)`
          : `Deposit of $${amount.toFixed(2)} from ${cryptoCurrency} confirmed`,
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

    console.error('Deposit error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

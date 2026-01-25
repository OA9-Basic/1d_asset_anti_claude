import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

const processWithdrawalSchema = z.object({
  status: z.enum(['PROCESSING', 'COMPLETED', 'REJECTED']),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  txHash: z.string().optional(),
});

// Helper: Verify admin role
async function verifyAdmin(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

// GET - Get withdrawal details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdmin(req);

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const withdrawal = await db.withdrawalRequest.findUnique({
      where: { id: params.id },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error('Withdrawal fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Process withdrawal (approve/reject)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdmin(req);

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const body = await req.json();
    const { status, adminNotes, rejectionReason, txHash } = processWithdrawalSchema.parse(body);

    const result = await db.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id: params.id },
        include: {
          wallet: true,
        },
      });

      if (!withdrawal) {
        throw new Error('Withdrawal not found');
      }

      if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'PROCESSING') {
        throw new Error(`Withdrawal is ${withdrawal.status.toLowerCase()}, cannot update`);
      }

      let updatedWithdrawal: any;

      if (status === 'COMPLETED') {
        // Mark as completed
        updatedWithdrawal = await tx.withdrawalRequest.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            adminNotes,
            processedAt: new Date(),
          },
        });

        // Final transaction record
        await tx.transaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            amount: withdrawal.amount,
            balanceBefore: withdrawal.wallet.withdrawableBalance,
            balanceAfter: withdrawal.wallet.withdrawableBalance,
            referenceId: withdrawal.id,
            referenceType: 'WITHDRAWAL',
            description: `Withdrawal completed: ${withdrawal.amount} ${withdrawal.cryptoCurrency}`,
            metadata: {
              txHash,
              walletAddress: withdrawal.walletAddress,
            },
          },
        });

        // Update wallet totals
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            lockedBalance: { decrement: withdrawal.amount },
            totalWithdrawn: { increment: withdrawal.amount },
          },
        });
      } else if (status === 'REJECTED') {
        // Reject and restore balance
        updatedWithdrawal = await tx.withdrawalRequest.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            adminNotes,
            rejectionReason: rejectionReason || 'No reason provided',
            processedAt: new Date(),
          },
        });

        // Restore withdrawable balance
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            withdrawableBalance: { increment: withdrawal.amount },
            lockedBalance: { decrement: withdrawal.amount },
          },
        });

        // Create reversal transaction
        await tx.transaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: 'WITHDRAWAL',
            status: 'REVERSED',
            amount: withdrawal.amount,
            balanceBefore: withdrawal.wallet.withdrawableBalance,
            balanceAfter: withdrawal.wallet.withdrawableBalance + withdrawal.amount,
            referenceId: withdrawal.id,
            referenceType: 'WITHDRAWAL_REVERSAL',
            description: `Withdrawal rejected: ${rejectionReason || 'Admin rejected'}`,
          },
        });
      } else {
        // PROCESSING status
        updatedWithdrawal = await tx.withdrawalRequest.update({
          where: { id: params.id },
          data: {
            status: 'PROCESSING',
            adminNotes,
          },
        });
      }

      return updatedWithdrawal;
    });

    return NextResponse.json({
      success: true,
      withdrawal: result,
      message: `Withdrawal ${status.toLowerCase()}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Withdrawal processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET_ALL - List all withdrawals (admin)
// Note: This should be in a separate route file at /api/admin/withdrawals/route.ts
// This function is commented out as it conflicts with the dynamic [id] route
/*
export async function GET_ALL(req: NextRequest) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where,
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ withdrawals })

  } catch (error) {
    console.error('Withdrawals list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
*/

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const withdrawalRequestSchema = z.object({
  amount: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || num <= 0) throw new Error('Amount must be positive')
    return num
  }),
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'XMR', 'LTC', 'BCH']),
  walletAddress: z.string().min(10),
})

// GET - Get user's withdrawal requests
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where: { userId },
      include: {
        wallet: {
          select: {
            balance: true,
            withdrawableBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ withdrawals })

  } catch (error) {
    console.error('Withdrawal requests fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create withdrawal request
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, cryptoCurrency, walletAddress } = withdrawalRequestSchema.parse(body)

    const result = await db.$transaction(async (tx) => {
      // Get user wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      })

      if (!wallet) {
        throw new Error('Wallet not found')
      }

      // Check withdrawable balance
      if (wallet.withdrawableBalance < amount) {
        throw new Error(`Insufficient withdrawable balance. Available: $${wallet.withdrawableBalance.toFixed(2)}`)
      }

      // Lock the amount
      const balanceBefore = wallet.withdrawableBalance
      const lockedAmount = wallet.lockedBalance + amount
      const withdrawableAfter = wallet.withdrawableBalance - amount

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          withdrawableBalance: withdrawableAfter,
          lockedBalance: lockedAmount,
        },
      })

      // Create withdrawal request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          walletId: wallet.id,
          userId,
          amount,
          cryptoCurrency,
          walletAddress,
          status: 'PENDING',
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL_REQUEST',
          status: 'PENDING',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: withdrawableAfter,
          referenceId: withdrawal.id,
          referenceType: 'WITHDRAWAL_REQUEST',
          description: `Withdrawal request: ${amount} ${cryptoCurrency}`,
        },
      })

      return {
        withdrawal,
        newWithdrawableBalance: withdrawableAfter,
      }
    })

    return NextResponse.json({
      success: true,
      withdrawalId: result.withdrawal.id,
      amount: result.withdrawal.amount,
      cryptoCurrency: result.withdrawal.cryptoCurrency,
      newWithdrawableBalance: result.newWithdrawableBalance,
      message: 'Withdrawal request submitted. Awaiting admin approval.',
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 })
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('insufficient')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Withdrawal request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel withdrawal request
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const withdrawalId = searchParams.get('id')

    if (!withdrawalId) {
      return NextResponse.json({ error: 'Withdrawal ID required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
      })

      if (!withdrawal) {
        throw new Error('Withdrawal request not found')
      }

      if (withdrawal.userId !== userId) {
        throw new Error('Unauthorized')
      }

      if (withdrawal.status !== 'PENDING') {
        throw new Error('Can only cancel pending withdrawals')
      }

      // Restore balance
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          withdrawableBalance: { increment: withdrawal.amount },
          lockedBalance: { decrement: withdrawal.amount },
        },
      })

      // Update withdrawal status
      await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: 'CANCELLED' },
      })

      return { success: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request cancelled',
    })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Withdrawal cancellation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

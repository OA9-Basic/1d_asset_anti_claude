import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const depositSchema = z.object({
  amount: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || num <= 0) throw new Error('Invalid amount')
    return num
  }),
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'XMR', 'LTC', 'BCH', 'MOCK']).default('MOCK'),
  txHash: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, cryptoCurrency, txHash } = depositSchema.parse(body)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      const description = cryptoCurrency === 'MOCK'
        ? 'Test deposit (Mock mode)'
        : `Crypto deposit (${cryptoCurrency})`

      if (!user.wallet) {
        const newWallet = await tx.wallet.create({
          data: {
            userId: user.id,
            balance: amount,
            totalDeposited: amount,
          },
        })

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
        })

        return {
          balance: newWallet.balance,
          transaction,
        }
      }

      const balanceBefore = user.wallet.balance
      const balanceAfter = balanceBefore + amount

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
      })

      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: balanceAfter,
          totalDeposited: { increment: amount },
        },
      })

      return {
        balance: updatedWallet.balance,
        transaction,
      }
    })

    return NextResponse.json({
      success: true,
      balance: result.balance,
      transactionId: result.transaction.id,
      message: cryptoCurrency === 'MOCK'
        ? `Test deposit of $${amount.toFixed(2)} added (development mode)`
        : `Deposit of $${amount.toFixed(2)} from ${cryptoCurrency} confirmed`,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 })
    }

    console.error('Deposit error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}

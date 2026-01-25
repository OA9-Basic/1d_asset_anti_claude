import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const pledgeSchema = z.object({
  assetId: z.string().cuid(),
  amount: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || num <= 0) throw new Error('Invalid amount')
    return num
  }),
})

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { assetId, amount } = pledgeSchema.parse(body)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      })

      if (!user?.wallet) {
        throw new Error('Wallet not found')
      }

      if (user.wallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      })

      if (!asset) {
        throw new Error('Asset not found')
      }

      if (asset.status !== 'COLLECTING') {
        throw new Error('Asset is not accepting pledges')
      }

      const existingPledge = await tx.pledge.findUnique({
        where: {
          userId_assetId: {
            userId: user.id,
            assetId: assetId,
          },
        },
      })

      if (existingPledge) {
        throw new Error('Already pledged to this asset')
      }

      const balanceBefore = user.wallet.balance
      const balanceAfter = balanceBefore - amount

      const debitTransaction = await tx.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'PLEDGE',
          status: 'COMPLETED',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          referenceId: assetId,
          referenceType: 'ASSET_PLEDGE',
          description: `Pledge to asset: ${asset.title}`,
        },
      })

      await tx.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: balanceAfter },
      })

      const pledge = await tx.pledge.create({
        data: {
          userId: user.id,
          assetId: assetId,
          amount: amount,
          status: 'ACTIVE',
        },
      })

      const newCollected = asset.currentCollected + amount
      const assetUpdateData: any = {
        currentCollected: newCollected,
        totalPledges: { increment: 1 },
      }

      if (newCollected >= asset.targetPrice) {
        assetUpdateData.status = 'PURCHASED'
        assetUpdateData.purchasedAt = new Date()
      }

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: assetUpdateData,
      })

      return {
        pledge,
        debitTransaction,
        updatedAsset,
        newBalance: balanceAfter,
      }
    })

    return NextResponse.json({
      pledgeId: result.pledge.id,
      transactionId: result.debitTransaction.id,
      assetStatus: result.updatedAsset.status,
      newBalance: result.newBalance,
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
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
      }
      if (message.includes('not found') || message.includes('wallet')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (message.includes('not accepting') || message.includes('already pledged')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Pledge error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}

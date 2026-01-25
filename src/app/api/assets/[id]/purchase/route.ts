import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { distributeProfit } from '@/lib/profit-distribution'
import { checkUserAssetAccess } from '@/lib/asset-processing'
import { z } from 'zod'

const purchaseSchema = z.object({
  amount: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num) || num < 1) throw new Error('Amount must be at least $1')
    return num
  }),
})

/**
 * Purchase an asset
 * SECURITY: Contributors who helped fund the asset already have access
 * They cannot purchase again to get profit sharing on their own contribution
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assetId = params.id
    const body = await req.json()
    const { amount } = purchaseSchema.parse(body)

    // SECURITY: Check if user already has access through contribution or purchase
    const accessCheck = await checkUserAssetAccess(userId, assetId)

    if (accessCheck.hasAccess) {
      return NextResponse.json({
        error: 'You already have access to this asset',
        hasAccess: true,
        accessType: accessCheck.accessType,
      }, { status: 400 })
    }

    // SECURITY: Also check if user has contributed (even if asset not yet processed)
    const contribution = await db.contribution.findFirst({
      where: {
        userId,
        assetId,
        status: { in: ['ACTIVE', 'CONVERTED_TO_INVESTMENT'] },
      },
    })

    if (contribution) {
      return NextResponse.json({
        error: 'You have already contributed to this asset. You will get access once it is processed.',
        hasContributed: true,
        contributionAmount: contribution.amount,
        excessAmount: contribution.excessAmount,
      }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      // Get user wallet
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      })

      if (!user?.wallet) {
        throw new Error('Wallet not found')
      }

      // Get asset
      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      })

      if (!asset) {
        throw new Error('Asset not found')
      }

      // Only allow purchase of AVAILABLE assets
      // PURCHASED assets are still being processed by admin
      if (asset.status !== 'AVAILABLE') {
        throw new Error(`Asset is ${asset.status.toLowerCase()} and not available for purchase`)
      }

      // Check if user already purchased
      const existingPurchase = await tx.assetPurchase.findFirst({
        where: {
          userId: user.id,
          assetId: assetId,
        },
      })

      if (existingPurchase) {
        throw new Error('You already own this asset')
      }

      // SECURITY: Validate purchase amount matches expected price
      // For secondary purchases (AVAILABLE status), the price is always $1
      const expectedPrice = 1

      // Allow small variations for rounding, but prevent exploitation
      if (Math.abs(amount - expectedPrice) > 0.01) {
        throw new Error(`Invalid purchase amount. Expected: $${expectedPrice.toFixed(2)}`)
      }

      // Check balance
      if (user.wallet.balance < amount) {
        throw new Error('Insufficient balance')
      }

      // Deduct from wallet
      const balanceBefore = user.wallet.balance
      const balanceAfter = balanceBefore - amount

      await tx.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'ASSET_PURCHASE',
          status: 'COMPLETED',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          referenceId: assetId,
          referenceType: 'ASSET_PURCHASE',
          description: `Purchased: ${asset.title}`,
        },
      })

      await tx.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: balanceAfter },
      })

      // Generate access key
      const accessKey = Buffer.from(`${userId}-${assetId}-${Date.now()}`).toString('base64')

      const purchase = await tx.assetPurchase.create({
        data: {
          userId: user.id,
          assetId: assetId,
          purchaseAmount: amount,
          deliveryAccessKey: accessKey,
          deliveryExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      })

      // Update asset stats
      await tx.asset.update({
        where: { id: assetId },
        data: {
          totalPurchases: { increment: 1 },
          totalRevenue: { increment: amount },
        },
      })

      // Distribute profit to over-contributors (investors)
      const profitResult = await distributeProfit(assetId, amount, tx)

      return {
        purchase,
        newBalance: balanceAfter,
        profitDistributed: profitResult.contributorProfit,
      }
    })

    return NextResponse.json({
      success: true,
      purchaseId: result.purchase.id,
      accessKey: result.purchase.deliveryAccessKey,
      newBalance: result.newBalance,
      profitDistributed: result.profitDistributed,
    })

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
      if (message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (message.includes('not available')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Purchase error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}

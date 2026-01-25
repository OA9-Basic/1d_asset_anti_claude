import { Prisma } from '@prisma/client'

import { db } from './db'

export interface DistributionResult {
  success: boolean
  assetId: string
  totalRevenue: number
  platformProfit: number
  contributorProfit: number
  distributedShares: number
  message: string
}

/**
 * Distribute profit from asset purchases to over-contributors (investors)
 * Called when someone purchases an already-funded asset
 *
 * Flow:
 * 1. Asset is purchased for $1 by a user
 * 2. Platform takes its fee (e.g., 15% = $0.15)
 * 3. Remaining profit ($0.85) is distributed to over-contributors
 * 4. Distribution is proportional to their excess contribution amounts
 */

// Helper type for Transaction Client
type TransactionClient = Omit<Prisma.TransactionClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

export async function distributeProfit(
  assetId: string,
  purchaseAmount: number = 1,
  tx?: TransactionClient
): Promise<DistributionResult> {
  const runDistribution = async (prisma: TransactionClient) => {
    // Get asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      throw new Error('Asset not found')
    }

    // Only distribute profit for AVAILABLE assets
    if (asset.status !== 'AVAILABLE' && asset.status !== 'PURCHASED') {
      return {
        success: false,
        assetId,
        totalRevenue: 0,
        platformProfit: 0,
        contributorProfit: 0,
        distributedShares: 0,
        message: 'Asset not available for profit distribution',
      }
    }

    const platformFee = asset.platformFee || 0.15

    // Calculate profit split
    const platformProfit = purchaseAmount * platformFee
    const contributorProfit = purchaseAmount - platformProfit

    // Get all investor contributions (those with excess amounts)
    // Only include those who haven't been fully refunded yet
    const contributions = await prisma.contribution.findMany({
      where: {
        assetId,
        isInvestment: true,
        status: 'ACTIVE',
      },
    })

    // Filter to only those who still need refunds
    const activeInvestors = contributions.filter(c => c.totalProfitReceived < c.excessAmount)

    if (activeInvestors.length === 0) {
      // No investors need refunds - all profit goes to platform
      return {
        success: true,
        assetId,
        totalRevenue: purchaseAmount,
        platformProfit: purchaseAmount,
        contributorProfit: 0,
        distributedShares: 0,
        message: 'All investors fully refunded - profit goes to platform',
      }
    }

    // Recalculate profit share ratios based on remaining amounts owed
    const totalRemainingOwed = activeInvestors.reduce(
      (sum, c) => sum + (c.excessAmount - c.totalProfitReceived),
      0
    )

    // Distribute profit proportionally based on remaining amounts owed
    let distributedShares = 0

    for (const contribution of activeInvestors) {
      const remainingOwed = contribution.excessAmount - contribution.totalProfitReceived

      if (remainingOwed <= 0) continue

      // Calculate share based on remaining owed amount
      const shareRatio = remainingOwed / totalRemainingOwed
      let shareAmount = contributorProfit * shareRatio

      // Cap at remaining owed amount
      shareAmount = Math.min(shareAmount, remainingOwed)

      if (shareAmount <= 0) continue

      // Get contributor's wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId: contribution.userId },
      })

      if (!wallet) continue

      // Add to withdrawable balance
      const balanceBefore = wallet.withdrawableBalance
      const balanceAfter = balanceBefore + shareAmount

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'PROFIT_DISTRIBUTION',
          status: 'COMPLETED',
          amount: shareAmount,
          balanceBefore,
          balanceAfter,
          referenceId: assetId,
          referenceType: 'PROFIT_SHARE',
          description: `Profit share from: ${asset.title}`,
        },
      })

      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          withdrawableBalance: balanceAfter,
          totalProfitReceived: wallet.totalProfitReceived + shareAmount,
        },
      })

      // Update contribution profit tracking
      const newTotalProfitReceived = contribution.totalProfitReceived + shareAmount
      const isFullyRefunded = newTotalProfitReceived >= contribution.excessAmount

      await prisma.contribution.update({
        where: { id: contribution.id },
        data: {
          totalProfitReceived: newTotalProfitReceived,
          status: isFullyRefunded ? 'CONVERTED_TO_INVESTMENT' : 'ACTIVE',
        },
      })

      // Record profit share
      await prisma.profitShare.create({
        data: {
          contributionId: contribution.id,
          assetId,
          userId: contribution.userId,
          amount: shareAmount,
          shareRatio: shareRatio,
          dailyRevenue: purchaseAmount,
        },
      })

      distributedShares++
    }

    // Update asset totals
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        totalRevenue: asset.totalRevenue + purchaseAmount,
        totalProfitDistributed: asset.totalProfitDistributed + contributorProfit,
      },
    })

    // Record distribution
    await prisma.profitDistribution.create({
      data: {
        assetId,
        totalRevenue: purchaseAmount,
        platformProfit,
        contributorProfit,
        distributedShares,
      },
    })

    return {
      success: true,
      assetId,
      totalRevenue: purchaseAmount,
      platformProfit,
      contributorProfit,
      distributedShares,
      message: `Distributed $${contributorProfit.toFixed(2)} to ${distributedShares} investors`,
    }
  }

  // Use provided transaction or create a new one
  if (tx) {
    return await runDistribution(tx)
  } else {
    return await db.$transaction(async (newTx) => {
      return await runDistribution(newTx)
    })
  }
}

/**
 * Run daily profit distribution for all available assets
 * This would typically be run as a cron job
 */
export async function runDailyProfitDistribution() {
  // Get all assets that have purchases since last distribution
  const assets = await db.asset.findMany({
    where: {
      status: { in: ['AVAILABLE', 'PURCHASED'] },
    },
    include: {
      _count: {
        select: { assetPurchases: true },
      },
    },
  })

  const results = []

  for (const asset of assets) {
    // Get purchases since last distribution
    const lastDistribution = await db.profitDistribution.findFirst({
      where: { assetId: asset.id },
      orderBy: { distributionDate: 'desc' },
    })

    const recentPurchases = await db.assetPurchase.findMany({
      where: {
        assetId: asset.id,
        createdAt: lastDistribution
          ? { gte: lastDistribution.distributionDate }
          : undefined,
      },
    })

    if (recentPurchases.length > 0) {
      const result = await distributeProfit(asset.id, recentPurchases.length)
      results.push({ assetId: asset.id, assetTitle: asset.title, ...result as any })
    }
  }

  return {
    totalProcessed: results.length,
    distributions: results,
  }
}

/**
 * Get profit distribution history for an asset
 */
export async function getAssetDistributionHistory(assetId: string) {
  const distributions = await db.profitDistribution.findMany({
    where: { assetId },
    orderBy: { distributionDate: 'desc' },
  })

  const totalRevenue = distributions.reduce((sum, d) => sum + d.totalRevenue, 0)
  const totalPlatformProfit = distributions.reduce((sum, d) => sum + d.platformProfit, 0)
  const totalContributorProfit = distributions.reduce((sum, d) => sum + d.contributorProfit, 0)

  return {
    totalRevenue,
    totalPlatformProfit,
    totalContributorProfit,
    distributions: distributions.map((d) => ({
      date: d.distributionDate,
      revenue: d.totalRevenue,
      platformProfit: d.platformProfit,
      contributorProfit: d.contributorProfit,
      shares: d.distributedShares,
    })),
  }
}

/**
 * Get user's profit shares across all assets
 */
export async function getUserProfitShares(userId: string) {
  const shares = await db.profitShare.findMany({
    where: { userId },
    include: {
      asset: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
    },
    orderBy: { distributedAt: 'desc' },
  })

  // Group by asset
  const byAsset = new Map<string, any>()

  for (const share of shares) {
    if (!byAsset.has(share.assetId)) {
      byAsset.set(share.assetId, {
        asset: share.asset,
        totalReceived: 0,
        shareCount: 0,
        shares: [],
      })
    }

    const data = byAsset.get(share.assetId)!
    data.totalReceived += share.amount
    data.shareCount++
    data.shares.push({
      amount: share.amount,
      ratio: share.shareRatio,
      date: share.distributedAt,
    })
  }

  const totalReceived = shares.reduce((sum, s) => sum + s.amount, 0)

  return {
    totalReceived,
    assets: Array.from(byAsset.values()),
  }
}

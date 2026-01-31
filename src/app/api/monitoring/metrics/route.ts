import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { apiLogger } from '@/lib/loggers';

/**
 * Metrics Endpoint
 *
 * Provides application metrics for monitoring and observability.
 * This endpoint should be secured in production (admin only, API keys, etc.)
 *
 * Metrics include:
 * - User counts (total, active, verified)
 * - Asset counts (by status)
 * - Financial metrics (total contributed, revenue)
 * - System metrics (database latency)
 *
 * @security This should be protected with authentication in production
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  const url = new URL(req.url);

  // Simple API key check (in production, use proper authentication)
  const apiKey = url.searchParams.get('key') || req.headers.get('x-api-key');
  const validApiKey = process.env.MONITORING_API_KEY;

  if (validApiKey && apiKey !== validApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parallel fetch of all metrics
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalAssets,
      collectingAssets,
      purchasedAssets,
      availableAssets,
      totalContributions,
      totalRevenue,
      activeGapLoans,
      recentRegistrations,
      pendingWithdrawals,
    ] = await Promise.all([
      // User metrics
      db.user.count(),
      db.user.count({ where: { isActive: true, deletedAt: null } }),
      db.user.count({ where: { emailVerified: true, deletedAt: null } }),

      // Asset metrics
      db.asset.count({ where: { deletedAt: null } }),
      db.asset.count({ where: { status: 'COLLECTING', deletedAt: null } }),
      db.asset.count({ where: { status: 'PURCHASED', deletedAt: null } }),
      db.asset.count({ where: { status: 'AVAILABLE', deletedAt: null } }),

      // Financial metrics
      db.contribution.count(),
      db.asset.aggregate({
        where: { deletedAt: null },
        _sum: { totalRevenue: true },
      }),

      // Gap loan metrics
      db.gapLoan.count({ where: { status: 'ACTIVE' } }),

      // Recent activity (last 24 hours)
      db.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),

      // Pending withdrawals
      db.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    ]);

    // Calculate funding progress stats
    const fundingStats = await db.asset.findMany({
      where: {
        status: { in: ['COLLECTING', 'PURCHASED'] },
        deletedAt: null,
      },
      select: {
        targetPrice: true,
        currentCollected: true,
        status: true,
      },
    });

    const totalFundingGoal = fundingStats.reduce((sum, asset) => sum + Number(asset.targetPrice), 0);
    const totalCollected = fundingStats.reduce((sum, asset) => sum + Number(asset.currentCollected), 0);
    const averageFundingProgress = totalFundingGoal > 0 ? (totalCollected / totalFundingGoal) * 100 : 0;

    const metrics = {
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,

      // User Metrics
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) + '%' : '0%',
        recentRegistrations24h: recentRegistrations,
      },

      // Asset Metrics
      assets: {
        total: totalAssets,
        collecting: collectingAssets,
        purchased: purchasedAssets,
        available: availableAssets,
        averageFundingProgress: averageFundingProgress.toFixed(1) + '%',
      },

      // Financial Metrics
      financial: {
        totalContributions: totalContributions,
        totalRevenue: totalRevenue._sum.totalRevenue?.toString() || '0',
        activeGapLoans: activeGapLoans,
        pendingWithdrawals: pendingWithdrawals,
      },

      // System Health
      system: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Log metrics fetch
    apiLogger.info('Metrics fetched', {
      responseTime: metrics.responseTime,
      userCount: totalUsers,
      assetCount: totalAssets,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    apiLogger.error('Metrics fetch failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

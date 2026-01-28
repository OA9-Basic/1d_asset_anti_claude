import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

export async function GET() {
  try {
    // Get real stats from database
    const [
      totalUsers,
      totalAssets,
      activeAssets,
      fundedAssets,
      totalContributions,
      activeContributors,
    ] = await Promise.all([
      // Total registered users
      db.user.count(),
      // Total assets (all statuses)
      db.asset.count(),
      // Currently active assets (being funded)
      db.asset.count({
        where: {
          status: 'COLLECTING',
        },
      }),
      // Successfully funded assets
      db.asset.count({
        where: {
          status: {
            in: ['AVAILABLE', 'PURCHASED'],
          },
        },
      }),
      // Total contributions made
      db.contribution.count(),
      // Unique users who have contributed (active community members)
      db.contribution.groupBy({
        by: ['userId'],
      }),
    ]);

    // Calculate average funding time for funded assets
    const fundedAssetsWithDates = await db.asset.findMany({
      where: {
        status: {
          in: ['AVAILABLE', 'PURCHASED'],
        },
        approvedAt: {
          not: null,
        },
        purchasedAt: {
          not: null,
        },
      },
      select: {
        approvedAt: true,
        purchasedAt: true,
      },
    });

    let avgFundingHours = 0;
    if (fundedAssetsWithDates.length > 0) {
      const totalHours = fundedAssetsWithDates.reduce((acc, asset) => {
        if (asset.approvedAt && asset.purchasedAt) {
          const hours =
            Math.abs(new Date(asset.purchasedAt).getTime() - new Date(asset.approvedAt).getTime()) /
            36e5;
          return acc + hours;
        }
        return acc;
      }, 0);
      avgFundingHours = totalHours / fundedAssetsWithDates.length;
    }

    // Calculate total amount collected
    const totalCollectedResult = await db.asset.aggregate({
      _sum: {
        currentCollected: true,
      },
    });

    const stats = {
      users: totalUsers,
      totalAssets,
      activeAssets,
      fundedAssets,
      totalContributions,
      activeContributors: activeContributors.length,
      avgFundingHours: Math.round(avgFundingHours),
      totalCollected: Math.round(prismaDecimalToNumber(totalCollectedResult._sum.currentCollected || 0)),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

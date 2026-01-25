import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        contributions: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            amount: true,
            assetId: true,
            createdAt: true,
            asset: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                type: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assetPurchases: {
          select: {
            id: true,
            assetId: true,
            createdAt: true,
            asset: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                type: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active votes (asset requests user has voted on that are in VOTING status)
    const userVotes = await db.vote.findMany({
      where: {
        userId: user.id,
      },
      include: {
        assetRequest: {
          select: {
            id: true,
            title: true,
            status: true,
            thumbnail: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeVotes = userVotes.filter((v) => v.assetRequest.status === 'VOTING').length;

    // Count total assets user has access to (contributions to funded/purchased assets + purchases)
    const assetsOwned =
      user.contributions.filter(
        (c) => c.asset.status === 'PURCHASED' || c.asset.status === 'AVAILABLE'
      ).length + user.assetPurchases.length;

    // Get recent activity (transactions and contributions)
    const transactions = await db.transaction.findMany({
      where: {
        walletId: user.wallet?.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentActivity = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      stats: {
        totalContributed: user.wallet?.totalContributed ?? 0,
        activeVotes,
        assetsOwned,
        walletBalance: user.wallet?.balance ?? 0,
        withdrawableBalance: user.wallet?.withdrawableBalance ?? 0,
        storeCredit: user.wallet?.storeCredit ?? 0,
      },
      contributions: user.contributions,
      purchases: user.assetPurchases,
      recentActivity,
      votes: userVotes,
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

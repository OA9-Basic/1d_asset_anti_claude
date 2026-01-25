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
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get all assets that are in COLLECTING or PURCHASED status
    const assets = await db.asset.findMany({
      where: {
        status: {
          in: ['COLLECTING', 'PURCHASED', 'AVAILABLE'],
        },
      },
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate funding status for each asset
    const assetsWithFundingStatus = assets.map((asset) => {
      const platformFee = asset.platformFee || 0.15;
      const targetAmount = asset.targetPrice * (1 + platformFee);
      const isFullyFunded = asset.currentCollected >= targetAmount;
      const progress = targetAmount > 0 ? (asset.currentCollected / targetAmount) * 100 : 0;

      return {
        id: asset.id,
        title: asset.title,
        type: asset.type,
        thumbnail: asset.thumbnail,
        targetPrice: asset.targetPrice,
        platformFee,
        targetAmount,
        currentCollected: asset.currentCollected,
        status: asset.status,
        isFullyFunded,
        progress,
        contributorCount: asset._count.contributions,
        createdAt: asset.createdAt,
      };
    });

    return NextResponse.json({
      assets: assetsWithFundingStatus,
    });
  } catch (error) {
    console.error('Funded assets error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

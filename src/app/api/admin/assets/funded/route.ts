import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  prismaDecimalToNumber,
  isPrismaDecimalGreaterThan,
  isPrismaDecimalGreaterThanOrEqual,
  addPrismaDecimals,
  multiplyPrismaDecimals,
} from '@/lib/prisma-decimal';

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
      const platformFee = prismaDecimalToNumber(asset.platformFee) || 0.15;
      const targetAmount = multiplyPrismaDecimals(asset.targetPrice, 1 + platformFee);
      const isFullyFunded = isPrismaDecimalGreaterThanOrEqual(asset.currentCollected, prismaDecimalToNumber(targetAmount));
      const progress = isPrismaDecimalGreaterThan(targetAmount, 0)
        ? prismaDecimalToNumber(multiplyPrismaDecimals(asset.currentCollected, 100)) / prismaDecimalToNumber(targetAmount)
        : 0;

      return {
        id: asset.id,
        title: asset.title,
        type: asset.type,
        thumbnail: asset.thumbnail,
        targetPrice: prismaDecimalToNumber(asset.targetPrice),
        platformFee,
        targetAmount: prismaDecimalToNumber(targetAmount),
        currentCollected: prismaDecimalToNumber(asset.currentCollected),
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

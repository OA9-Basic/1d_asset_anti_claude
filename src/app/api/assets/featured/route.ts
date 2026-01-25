import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

type AssetOrderBy = Prisma.AssetsOrderByWithRelationInput;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const trending = searchParams.get('trending') === 'true';

    let orderBy: AssetOrderBy = { createdAt: 'desc' };

    // If trending, order by purchases and collected amount
    if (trending) {
      orderBy = [{ totalPurchases: 'desc' }, { currentCollected: 'desc' }];
    }

    const assets = await db.asset.findMany({
      where: {
        status: {
          in: ['COLLECTING', 'AVAILABLE', 'PURCHASED'],
        },
      },
      orderBy,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        deliveryType: true,
        targetPrice: true,
        platformFee: true,
        currentCollected: true,
        status: true,
        totalPurchases: true,
        totalRevenue: true,
        thumbnail: true,
        featured: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Featured assets fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

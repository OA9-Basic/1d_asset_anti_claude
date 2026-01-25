import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    // Get the current asset to find its type
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { type: true, status: true },
    });

    if (!currentAsset) {
      return NextResponse.json({ assets: [] });
    }

    // Find related assets by type, excluding current asset
    const relatedAssets = await prisma.asset.findMany({
      where: {
        id: { not: assetId },
        type: currentAsset.type,
        status: { in: ['APPROVED', 'COLLECTING', 'AVAILABLE'] },
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        thumbnail: true,
        totalPurchases: true,
      },
      orderBy: [{ featured: 'desc' }, { totalPurchases: 'desc' }],
      take: limit,
    });

    return NextResponse.json({ assets: relatedAssets });
  } catch (error) {
    console.error('Error fetching related assets:', error);
    return NextResponse.json({ assets: [] }, { status: 500 });
  }
}

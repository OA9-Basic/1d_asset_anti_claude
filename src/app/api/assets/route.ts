import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '12');
    const cursor = searchParams.get('cursor');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build where clause
    const where: any = {};

    // Filter by status
    if (statusParam) {
      const statuses = statusParam.split(',').map((s) => s.trim().toUpperCase());
      where.status = {
        in: statuses,
      };
    }

    // Filter by type
    if (typeParam) {
      const types = typeParam.split(',').map((t) => t.trim().toUpperCase());
      where.type = {
        in: types,
      };
    }

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.targetPrice = {};
      if (minPrice) {
        where.targetPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.targetPrice.lte = parseFloat(maxPrice);
      }
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'mostPurchased':
        orderBy = { totalPurchases: 'desc' };
        break;
      case 'mostFunded':
        orderBy = { currentCollected: 'desc' };
        break;
      case 'endingSoon':
        // This would need a deadline field, for now sort by createdAt
        orderBy = { createdAt: 'asc' };
        break;
      case 'trending':
        orderBy = [{ totalPurchases: 'desc' }, { currentCollected: 'desc' }];
        break;
      case 'priceAsc':
        orderBy = { targetPrice: 'asc' };
        break;
      case 'priceDesc':
        orderBy = { targetPrice: 'desc' };
        break;
      default:
        orderBy = { createdAt: order === 'asc' ? 'asc' : 'desc' };
    }

    // Build cursor-based pagination
    const cursorObj = cursor ? { id: cursor } : undefined;

    // Fetch assets
    const assets = await db.asset.findMany({
      where,
      orderBy,
      take: limit + 1, // Take one extra to check if there are more results
      cursor: cursorObj,
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
        availableAt: true,
        purchasedAt: true,
      },
    });

    // Check if there are more results
    let nextCursor: string | undefined = undefined;
    if (assets.length > limit) {
      const nextItem = assets.pop();
      nextCursor = nextItem!.id;
    }

    // Get total count for filters
    const totalCount = await db.asset.count({ where });

    return NextResponse.json({
      assets,
      nextCursor,
      totalCount,
      hasMore: nextCursor !== undefined,
    });
  } catch (error) {
    console.error('Assets list fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';

// Query parameter validation schema
const assetsQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'mostPurchased', 'mostFunded', 'endingSoon', 'trending', 'priceAsc', 'priceDesc', 'createdAt', 'targetPrice', 'currentCollected', 'totalPurchases']).default('newest'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  cursor: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate query parameters
    const query = assetsQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || 'newest',
      order: searchParams.get('order') || 'desc',
      limit: searchParams.get('limit') || '12',
      cursor: searchParams.get('cursor') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
    });

    const { status: statusParam, type: typeParam, search, sort, order, limit, cursor, minPrice, maxPrice } = query;

    // Build where clause with proper typing
    const where: Prisma.AssetWhereInput = {};

    // Filter by status
    if (statusParam) {
      const statuses = statusParam.split(',').map((s) => s.trim().toUpperCase());
      where.status = {
        in: statuses as Array<
          | 'REQUESTED'
          | 'APPROVED'
          | 'COLLECTING'
          | 'PURCHASED'
          | 'AVAILABLE'
          | 'PAUSED'
          | 'REJECTED'
        >,
      };
    }

    // Filter by type
    if (typeParam) {
      const types = typeParam.split(',').map((t) => t.trim().toUpperCase());
      where.type = {
        in: types as Array<'COURSE' | 'SOFTWARE' | 'TEMPLATE' | 'EBOOK' | 'AI_MODEL' | 'SAAS' | 'CODE' | 'MODEL_3D' | 'OTHER'>,
      };
    }

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.targetPrice = {};
      if (minPrice) {
        where.targetPrice.gte = minPrice;
      }
      if (maxPrice) {
        where.targetPrice.lte = maxPrice;
      }
    }

    // Build orderBy clause with proper typing
    let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: 'desc' };
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
        orderBy = { totalPurchases: 'desc' };
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
      if (nextItem) {
        nextCursor = nextItem.id;
      }
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

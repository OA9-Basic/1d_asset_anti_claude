import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';

// Query parameter validation
const activityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = activityQuerySchema.parse({
      limit: searchParams.get('limit') || '10',
    });

    // Get recent contributions across all assets
    const recentContributions = await db.contribution.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            email: true,
          },
        },
        asset: {
          select: {
            id: true,
            title: true,
            type: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const activityFeed = recentContributions.map((contribution) => ({
      id: contribution.id,
      type: 'contribution',
      amount: contribution.amount,
      user: {
        id: contribution.user.id,
        name: contribution.user.firstName || contribution.user.email?.split('@')[0] || 'Anonymous',
      },
      asset: {
        id: contribution.asset.id,
        title: contribution.asset.title,
        type: contribution.asset.type,
        thumbnail: contribution.asset.thumbnail,
      },
      createdAt: contribution.createdAt.toISOString(),
    }));

    return NextResponse.json({ activity: activityFeed });
  } catch (error) {
    console.error('Activity feed fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

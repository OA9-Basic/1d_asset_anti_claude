import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

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

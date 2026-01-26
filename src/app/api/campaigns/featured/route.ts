import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

/**
 * GET /api/campaigns/featured
 * Returns a single featured campaign with contributor data for the hero section
 */
export async function GET(_req: NextRequest) {
  try {
    // Get the most active collecting campaign (most contributions or closest to goal)
    const asset = await db.asset.findFirst({
      where: {
        status: 'COLLECTING',
      },
      orderBy: [
        { currentCollected: 'desc' }, // Most money collected
        { contributions: { _count: 'desc' } }, // Most contributors
      ],
      select: {
        id: true,
        title: true,
        description: true,
        targetPrice: true,
        currentCollected: true,
        createdAt: true,
        contributions: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            amount: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            contributions: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(null);
    }

    // Calculate days left (30-day campaign from creation)
    const daysElapsed = Math.floor((Date.now() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 30 - daysElapsed);

    // Calculate average pledge
    const completedContributions = asset.contributions.length;
    const avgPledge = completedContributions > 0
      ? Math.round(asset.currentCollected / completedContributions)
      : 0;

    // Format recent contributors
    const recentContributors = asset.contributions.map(c => ({
      id: c.id,
      amount: c.amount,
      userId: c.user.id,
      userName: c.user.username || `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() || 'Anonymous',
      userImage: c.user.avatar,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      raisedAmount: asset.currentCollected,
      goalAmount: asset.targetPrice,
      backerCount: asset._count.contributions,
      daysLeft,
      avgPledge,
      recentContributors,
    });
  } catch (error) {
    console.error('Featured campaign fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

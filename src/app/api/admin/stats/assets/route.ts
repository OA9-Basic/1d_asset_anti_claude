import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Helper: Verify admin role
async function verifyAdmin(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdmin(req);

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const [count, assets] = await Promise.all([
      db.asset.count(),
      db.asset.findMany({
        select: {
          totalRevenue: true,
        },
      }),
    ]);

    const revenue = assets.reduce((sum, a) => sum + (a.totalRevenue || 0), 0);

    return NextResponse.json({ count, revenue });
  } catch (error) {
    console.error('Assets stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

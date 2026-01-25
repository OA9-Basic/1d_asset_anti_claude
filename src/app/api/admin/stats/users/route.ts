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

    const count = await db.user.count();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Users stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.wallet?.balance ?? 0,
      withdrawableBalance: user.wallet?.withdrawableBalance ?? 0,
      storeCredit: user.wallet?.storeCredit ?? 0,
      totalDeposited: user.wallet?.totalDeposited ?? 0,
      totalWithdrawn: user.wallet?.totalWithdrawn ?? 0,
      totalContributed: user.wallet?.totalContributed ?? 0,
      totalProfitReceived: user.wallet?.totalProfitReceived ?? 0,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

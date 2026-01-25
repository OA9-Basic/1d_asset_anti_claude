import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Helper: Verify admin role
async function verifyAdmin(req: NextRequest) {
  const userId = await getUserFromToken(req)

  if (!userId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return user
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const withdrawals = await db.withdrawalRequest.findMany({
      where,
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        cryptoCurrency: w.cryptoCurrency,
        walletAddress: w.walletAddress,
        status: w.status,
        adminNotes: w.adminNotes,
        rejectionReason: w.rejectionReason,
        createdAt: w.createdAt.toISOString(),
        processedAt: w.processedAt?.toISOString(),
        user: w.wallet.user,
      })),
    })

  } catch (error) {
    console.error('Withdrawals list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

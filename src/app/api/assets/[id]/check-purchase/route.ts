import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ hasPurchased: false })
    }

    const purchase = await db.assetPurchase.findFirst({
      where: {
        assetId: params.id,
        userId,
      },
    })

    // Also check if user has contributed (contributors get access)
    const contribution = await db.contribution.findFirst({
      where: {
        assetId: params.id,
        userId,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      hasPurchased: !!purchase || !!contribution,
    })
  } catch (error) {
    console.error('Check purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

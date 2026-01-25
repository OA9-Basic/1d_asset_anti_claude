import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contributions = await db.contribution.findMany({
      where: { assetId: params.id },
      include: {
        user: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
      orderBy: {
        amount: 'desc',
      },
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Contributions fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

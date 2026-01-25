import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetRequest = await db.assetRequest.findUnique({
      where: { assetId: params.id },
      include: {
        votes: {
          select: {
            voteType: true,
          },
        },
      },
    })

    if (!assetRequest) {
      return NextResponse.json({ error: 'Asset request not found' }, { status: 404 })
    }

    return NextResponse.json(assetRequest)
  } catch (error) {
    console.error('Asset request fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

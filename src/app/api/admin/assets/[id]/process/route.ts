import { NextRequest, NextResponse } from 'next/server'

import { processFundedAsset } from '@/lib/asset-processing'
import { getUserFromToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const assetId = params.id

    // Get asset details
    const asset = await db.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    if (asset.status !== 'PURCHASED') {
      return NextResponse.json({
        error: `Asset is ${asset.status.toLowerCase()}. Only PURCHASED assets can be processed.`,
      }, { status: 400 })
    }

    const body = await req.json()
    const deliveryData = {
      deliveryUrl: body.deliveryUrl,
      streamUrl: body.streamUrl,
      deliveryKey: body.deliveryKey,
      externalAccessUrl: body.externalAccessUrl,
      externalCredentials: body.externalCredentials,
    }

    // Process the asset
    const result = await processFundedAsset(assetId, deliveryData)

    return NextResponse.json({
      success: true,
      message: result.message,
      assetId: result.assetId,
      contributorsRefunded: result.contributorsRefunded,
      totalRefunded: result.totalRefunded,
    })

  } catch (error) {
    console.error('Asset processing error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const asset = await db.asset.findUnique({
      where: { id: params.id },
      include: {
        contributions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Calculate processing summary
    const basePrice = asset.targetPrice
    const platformFee = asset.platformFee || 0.15
    const targetAmount = basePrice * (1 + platformFee)

    const contributionsWithRefundInfo = asset.contributions.map((c) => {
      const excessAmount = c.excessAmount
      const refundEligible = excessAmount > 0 ? excessAmount : 0
      const effectivePrice = basePrice

      return {
        id: c.id,
        userId: c.userId,
        userName: c.user.firstName || c.user.email,
        amount: c.amount,
        excessAmount: c.excessAmount,
        refundEligible,
        effectivePrice,
        createdAt: c.createdAt,
      }
    })

    const totalRefundable = contributionsWithRefundInfo.reduce(
      (sum, c) => sum + c.refundEligible,
      0
    )

    return NextResponse.json({
      asset: {
        id: asset.id,
        title: asset.title,
        status: asset.status,
        targetPrice: basePrice,
        platformFee,
        targetAmount,
        currentCollected: asset.currentCollected,
        isFullyFunded: asset.currentCollected >= targetAmount,
      },
      contributions: contributionsWithRefundInfo,
      summary: {
        totalContributors: asset.contributions.length,
        totalRefundable,
        totalCollected: asset.currentCollected,
        netCost: targetAmount - totalRefundable,
      },
    })

  } catch (error) {
    console.error('Asset processing info error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}

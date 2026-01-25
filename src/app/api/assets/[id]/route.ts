import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { checkUserAssetAccess } from '@/lib/asset-processing'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(req)

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
        assetPurchases: {
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
            createdAt: 'desc',
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    let userContribution = null
    let userPurchase = null
    let hasAccess = false
    let accessType = null

    if (userId) {
      userContribution = asset.contributions.find(c => c.userId === userId) || null
      userPurchase = asset.assetPurchases.find(p => p.userId === userId) || null

      const accessCheck = await checkUserAssetAccess(userId, params.id)
      hasAccess = accessCheck.hasAccess
      accessType = accessCheck.accessType || null
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        type: asset.type,
        deliveryType: asset.deliveryType,
        targetPrice: asset.targetPrice,
        platformFee: asset.platformFee,
        currentCollected: asset.currentCollected,
        status: asset.status,
        totalPurchases: asset.totalPurchases,
        totalRevenue: asset.totalRevenue,
        thumbnail: asset.thumbnail,
        sourceUrl: asset.sourceUrl,
        deliveryUrl: asset.deliveryUrl,
        createdAt: asset.createdAt,
      },
      contributions: asset.contributions,
      purchases: asset.assetPurchases,
      userContribution,
      userPurchase,
      hasAccess,
      accessType,
    })
  } catch (error) {
    console.error('Asset fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

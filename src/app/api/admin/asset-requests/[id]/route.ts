import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getUserFromToken } from '@/lib/auth'
import { db } from '@/lib/db'

const updateRequestSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'VOTING', 'APPROVED', 'REJECTED']).optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  platformFee: z.number().min(0).max(1).optional(),
})

const approveRequestSchema = z.object({
  platformFee: z.number().min(0).max(1).default(0.15),
  deliveryUrl: z.string().optional(),
  deliveryKey: z.string().optional(),
  streamUrl: z.string().optional(),
  externalAccessUrl: z.string().optional(),
  externalCredentials: z.object({}).optional(),
  featured: z.boolean().default(false),
})

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

// GET - Get single asset request details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const request = await db.assetRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
        asset: true,
      },
    })

    if (!request) {
      return NextResponse.json({ error: 'Asset request not found' }, { status: 404 })
    }

    const upvotes = request.votes.filter((v) => v.voteType === 'UPVOTE').length
    const downvotes = request.votes.filter((v) => v.voteType === 'DOWNVOTE').length

    return NextResponse.json({
      ...request,
      upvotes,
      downvotes,
      score: upvotes - downvotes,
    })

  } catch (error) {
    console.error('Asset request fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update asset request status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await req.json()
    const data = updateRequestSchema.parse(body)

    const request = await db.assetRequest.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.status === 'APPROVED' ? { approvedAt: new Date() } : {}),
        ...(data.status === 'REJECTED' ? { rejectedAt: new Date() } : {}),
        ...(data.status === 'VOTING' ? { votedAt: new Date() } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      request,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    console.error('Asset request update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Approve and create asset from request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await req.json()
    const data = approveRequestSchema.parse(body)

    const result = await db.$transaction(async (tx) => {
      const request = await tx.assetRequest.findUnique({
        where: { id: params.id },
      })

      if (!request) {
        throw new Error('Asset request not found')
      }

      if (request.status === 'APPROVED' && request.assetId) {
        throw new Error('Request already approved')
      }

      // Generate slug
      const slug = request.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36)

      // Create asset
      const asset = await tx.asset.create({
        data: {
          title: request.title,
          description: request.description,
          slug,
          type: request.type,
          deliveryType: request.deliveryType,
          targetPrice: request.estimatedPrice,
          platformFee: data.platformFee,
          status: 'COLLECTING',
          sourceUrl: request.sourceUrl,
          thumbnail: request.thumbnail,
          deliveryUrl: data.deliveryUrl,
          deliveryKey: data.deliveryKey,
          streamUrl: data.streamUrl,
          externalAccessUrl: data.externalAccessUrl,
          externalCredentials: data.externalCredentials,
          featured: data.featured,
          approvedAt: new Date(),
          metadata: request.metadata as any,
        },
      })

      // Update request
      const updatedRequest = await tx.assetRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          assetId: asset.id,
          approvedAt: new Date(),
        },
      })

      return { asset, request: updatedRequest }
    })

    return NextResponse.json({
      success: true,
      asset: result.asset,
      request: result.request,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Asset approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Reject and delete asset request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdmin(req)

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await req.json()
    const rejectionReason = body.rejectionReason || 'No reason provided'

    await db.assetRequest.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason,
        rejectedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Asset request rejected',
    })

  } catch (error) {
    console.error('Asset request rejection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

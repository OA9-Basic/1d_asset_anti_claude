import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

const assetRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.enum([
    'COURSE',
    'AI_MODEL',
    'SAAS',
    'SOFTWARE',
    'TEMPLATE',
    'CODE',
    'MODEL_3D',
    'EBOOK',
    'OTHER',
  ]),
  deliveryType: z.enum(['DOWNLOAD', 'STREAM', 'EXTERNAL', 'HYBRID']).default('DOWNLOAD'),
  estimatedPrice: z
    .string()
    .or(z.number())
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num <= 0) throw new Error('Price must be positive');
      return num;
    }),
  sourceUrl: z.string().url(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  metadata: z.object({}).optional(),
});

// GET - List all asset requests (with filtering)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const _status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const voting = searchParams.get('voting') === 'true';

    const where: Prisma.AssetRequestWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (voting) {
      where.status = 'VOTING';
    }

    const requests = await db.assetRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
        votes: {
          select: {
            id: true,
            voteType: true,
            user: {
              select: {
                id: true,
                firstName: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate vote scores
    const requestWithScores = requests.map((req) => {
      const upvotes = req.votes.filter((v) => v.voteType === 'UPVOTE').length;
      const downvotes = req.votes.filter((v) => v.voteType === 'DOWNVOTE').length;
      return {
        ...req,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
      };
    });

    return NextResponse.json({ requests: requestWithScores });
  } catch (error) {
    console.error('Asset requests fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new asset request
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = assetRequestSchema.parse(body);

    // Generate slug from title
    const _slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

    const request = await db.assetRequest.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type,
        deliveryType: data.deliveryType,
        estimatedPrice: data.estimatedPrice,
        sourceUrl: data.sourceUrl,
        thumbnail: data.thumbnail || null,
        metadata: data.metadata || {},
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        request,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Asset request creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

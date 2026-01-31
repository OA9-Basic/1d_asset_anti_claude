import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

const createAssetRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  targetPrice: z
    .string()
    .or(z.number())
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num) || num <= 0) throw new Error('Invalid target price');
      return num;
    }),
  type: z.enum(['COURSE', 'AI_MODEL', 'SAAS', 'SOFTWARE', 'TEMPLATE', 'CODE', 'MODEL_3D', 'EBOOK', 'OTHER']).optional(),
  deliveryType: z.enum(['DOWNLOAD', 'STREAM', 'EXTERNAL', 'HYBRID']).optional(),
  thumbnail: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check email verification
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required',
          message: 'Please verify your email address before creating asset requests. Check your inbox for the verification link.',
          requireVerification: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createAssetRequestSchema.parse(body);

    // Check if user already has a pending request with the same title
    const existingRequest = await db.assetRequest.findFirst({
      where: {
        userId,
        title: {
          equals: validatedData.title,
        },
        status: {
          in: ['PENDING', 'UNDER_REVIEW', 'VOTING'],
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending request for this asset',
          existingRequestId: existingRequest.id,
        },
        { status: 400 }
      );
    }

    // Create asset request instead of asset
    const assetRequest = await db.assetRequest.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type || 'OTHER',
        deliveryType: validatedData.deliveryType || 'DOWNLOAD',
        estimatedPrice: validatedData.targetPrice,
        sourceUrl: validatedData.sourceUrl || '',
        thumbnail: validatedData.thumbnail || null,
        metadata: validatedData.metadata,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        id: assetRequest.id,
        title: assetRequest.title,
        status: assetRequest.status,
        message: 'Your asset request has been submitted for admin review',
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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
          message: 'Please verify your email address before voting. Check your inbox for the verification link.',
          requireVerification: true,
        },
        { status: 403 }
      );
    }

    const assetRequestId = params.id;
    const body = await req.json();
    const { voteType } = voteSchema.parse(body);

    // Check if request exists and is in voting status
    const assetRequest = await db.assetRequest.findUnique({
      where: { id: assetRequestId },
    });

    if (!assetRequest) {
      return NextResponse.json({ error: 'Asset request not found' }, { status: 404 });
    }

    if (assetRequest.status !== 'VOTING') {
      return NextResponse.json({ error: 'This request is not open for voting' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_assetRequestId: {
          userId,
          assetRequestId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      const vote = await db.vote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });

      return NextResponse.json({
        success: true,
        vote,
        message: 'Vote updated',
      });
    }

    // Create new vote
    const vote = await db.vote.create({
      data: {
        userId,
        assetRequestId,
        voteType,
      },
    });

    return NextResponse.json(
      {
        success: true,
        vote,
        message: 'Vote recorded',
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

    console.error('Vote error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetRequestId = params.id;

    // Find and delete user's vote
    const vote = await db.vote.findUnique({
      where: {
        userId_assetRequestId: {
          userId,
          assetRequestId,
        },
      },
    });

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    await db.vote.delete({
      where: { id: vote.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vote removed',
    });
  } catch (error) {
    console.error('Vote deletion error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

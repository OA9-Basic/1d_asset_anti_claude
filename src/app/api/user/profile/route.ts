import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name must be at least 1 character').max(100, 'First name must be less than 100 characters').optional(),
  lastName: z.string().min(1, 'Last name must be at least 1 character').max(100, 'Last name must be less than 100 characters').optional(),
  phone: z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number format').optional().or(z.literal('')),
  location: z.string().max(200, 'Location must be less than 200 characters').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const validatedData = profileUpdateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, location, website, bio } = validatedData.data;

    // Build update data object with only provided fields
    const updateData: Record<string, string | undefined> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone || null;
    if (location !== undefined) updateData.location = location || null;
    if (website !== undefined) updateData.website = website || null;
    if (bio !== undefined) updateData.bio = bio || null;

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        website: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

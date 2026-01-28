/**
 * Authentication Middleware
 * Provides helpers for enforcing authentication and email verification
 */

import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Check if user is authenticated
 */
export async function requireAuth(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isActive: true,
      role: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
  }

  return { user };
}

/**
 * Check if user is authenticated AND has verified email
 */
export async function requireVerifiedUser(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isActive: true,
      role: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: 'User not found or inactive', code: 'USER_INACTIVE' },
      { status: 401 }
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      {
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address to access this feature',
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Check if user is admin
 */
export async function requireAdmin(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isActive: true,
      role: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  return { user };
}

/**
 * Check if user is admin AND has verified email
 */
export async function requireVerifiedAdmin(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isActive: true,
      role: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      {
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address to access this feature',
      },
      { status: 403 }
    );
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  return { user };
}

/**
 * Get user from request without enforcing auth
 * Returns null if not authenticated
 */
export async function getUserOptional(req: NextRequest) {
  const userId = await getUserFromToken(req);

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

/**
 * Type guard to check if response is an error
 */
export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

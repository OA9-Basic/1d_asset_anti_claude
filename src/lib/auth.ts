import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// CRITICAL SECURITY FIX: No fallback for JWT secret - must be set in environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set in production');
}

// Type assertion for TypeScript - we've verified JWT_SECRET is defined above
const SECRET: string = JWT_SECRET;

// Token expiration: 7 days
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { userId: string } | null;
  } catch {
    return null;
  }
}

export async function getUserFromToken(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')));

  const token = cookies.auth_token;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

/**
 * Generate a cryptographically secure access key
 * SECURITY FIX: Uses crypto.randomBytes instead of predictable base64 encoding
 */
export function generateSecureAccessKey(): string {
  return crypto.randomBytes(32).toString('base64url');
}

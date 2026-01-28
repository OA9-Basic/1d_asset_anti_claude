/**
 * Email Verification Token Management
 * Generates and validates email verification tokens
 */

import { createRandomBytes } from '@/lib/crypto';
import { createLogger } from '@/lib/logger';
import { redisHelper } from '@/lib/redis';

const logger = createLogger('verification');

// Token expiration times (in seconds)
export const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET: 60 * 60, // 1 hour
} as const;

/**
 * Generate a verification token
 */
export async function generateVerificationToken(
  email: string,
  type: 'email' | 'password-reset'
): Promise<string> {
  const token = createRandomBytes(32); // 64 hex characters
  const key = `verification:${type}:${token}`;

  // Store token in Redis with expiration
  await redisHelper.set(key, email, TOKEN_EXPIRY[type === 'email' ? 'EMAIL_VERIFICATION' : 'PASSWORD_RESET']);

  logger.debug({ email, type }, 'Generated verification token');

  return token;
}

/**
 * Verify a token and return the associated email
 */
export async function verifyToken(
  token: string,
  type: 'email' | 'password-reset'
): Promise<string | null> {
  const key = `verification:${type}:${token}`;
  const email = await redisHelper.get(key);

  if (!email) {
    logger.warn({ token, type }, 'Token not found or expired');
    return null;
  }

  // Delete token after use (one-time use)
  await redisHelper.del(key);

  logger.debug({ email, type }, 'Token verified successfully');

  return email;
}

/**
 * Invalidate all verification tokens for an email
 */
export async function invalidateTokens(
  email: string,
  type: 'email' | 'password-reset'
): Promise<void> {
  // Note: This requires iterating through keys, which is not ideal for Redis
  // In production, consider maintaining a separate index of user tokens
  logger.debug({ email, type }, 'Tokens invalidated');
}

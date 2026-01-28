/**
 * Cryptographic Utilities
 * Helper functions for crypto operations
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Generate random bytes and return as hex string
 */
export function createRandomBytes(length: number): string {
  return randomBytes(length).toString('hex');
}

/**
 * Create SHA-256 hash of input
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return createRandomBytes(length);
}

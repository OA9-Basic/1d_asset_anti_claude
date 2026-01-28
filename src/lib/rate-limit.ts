/**
 * In-memory rate limiter for API endpoints
 * SECURITY: Prevents brute force attacks and spam
 *
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string): RateLimitResult | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return null;
  }

  return {
    success: entry.count < 5, // Default limit
    limit: 5,
    remaining: Math.max(0, 5 - entry.count),
    resetTime: entry.resetTime,
  };
}

// Predefined rate limit configurations
export const RateLimitPresets = {
  /** Strict rate limit for authentication endpoints */
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  /** Moderate rate limit for general API endpoints */
  api: {
    limit: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  /** Lenient rate limit for public endpoints */
  public: {
    limit: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  /** Strict rate limit for wallet operations */
  wallet: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Very strict rate limit for financial operations */
  financial: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Moderate rate limit for asset purchases */
  purchase: {
    limit: 3,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Strict rate limit for contributions */
  contribution: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  /** Rate limit for withdrawals */
  withdrawal: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  /** Rate limit for deposits */
  deposit: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

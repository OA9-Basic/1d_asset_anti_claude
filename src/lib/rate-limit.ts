/**
 * Redis-based rate limiter for API endpoints
 * SECURITY: Prevents brute force attacks and spam
 *
 * Uses Redis for persistent rate limiting across server restarts.
 * Falls back to in-memory storage if Redis is not available.
 */

import { redisHelper, redis } from '@/lib/redis';
import { createLogger } from '@/lib/logger';

const logger = createLogger('rate-limit');

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory fallback (only used if Redis is not available)
const inMemoryStore = new Map<string, RateLimitEntry>();

// Clean up expired in-memory entries every 5 minutes
if (!redis) {
  setInterval(
    () => {
      const now = Date.now();
      const entries = Array.from(inMemoryStore.entries());
      for (const [key, entry] of entries) {
        if (now > entry.resetTime) {
          inMemoryStore.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}

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
 * Check if a request should be rate limited (sync version for backward compatibility)
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * NOTE: This is the default export for backward compatibility.
 * Use checkRateLimitAsync for Redis-based persistent rate limiting.
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const resetTime = now + config.windowMs;
  const key = `ratelimit:${identifier}`;

  const entry = inMemoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime,
    };
    inMemoryStore.set(identifier, newEntry);

    // Also set in Redis if available (async, fire and forget)
    if (redis) {
      redisHelper.set(key, '1', Math.floor(config.windowMs / 1000)).catch((err) => {
        logger.error({ error: err, identifier }, 'Failed to set rate limit in Redis');
      });
    }

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime,
    };
  }

  entry.count++;

  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Also update in Redis if available (async, fire and forget)
  if (redis) {
    redisHelper.set(key, entry.count.toString(), Math.floor(config.windowMs / 1000)).catch((err) => {
      logger.error({ error: err, identifier }, 'Failed to update rate limit in Redis');
    });
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Async version of checkRateLimit that uses Redis
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetTime = now + config.windowMs;
  const key = `ratelimit:${identifier}`;

  // Try Redis first
  if (redis) {
    try {
      // Get current count from Redis
      const current = await redisHelper.get(key);

      if (!current) {
        // First request or expired
        await redisHelper.set(key, '1', Math.floor(config.windowMs / 1000));

        return {
          success: true,
          limit: config.limit,
          remaining: config.limit - 1,
          resetTime,
        };
      }

      const count = parseInt(current, 10);

      if (count >= config.limit) {
        // Rate limit exceeded
        const ttlResult = await redisHelper.exists(key);
        const ttl = ttlResult && ttlResult > 0 ? ttlResult * 1000 : config.windowMs;

        return {
          success: false,
          limit: config.limit,
          remaining: 0,
          resetTime: now + ttl,
        };
      }

      // Increment counter
      const newCount = count + 1;
      await redisHelper.set(key, newCount.toString(), Math.floor(config.windowMs / 1000));

      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - newCount,
        resetTime,
      };
    } catch (error) {
      logger.error({ error, identifier }, 'Redis rate limit check failed, falling back to in-memory');
      // Fall through to in-memory implementation
    }
  }

  // In-memory fallback (same as sync version)
  return checkRateLimit(identifier, config);
}

/**
 * Reset rate limit for a specific identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const key = `ratelimit:${identifier}`;

  if (redis) {
    try {
      await redisHelper.del(key);
    } catch (error) {
      logger.error({ error, identifier }, 'Failed to reset rate limit in Redis');
    }
  }

  inMemoryStore.delete(identifier);
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(identifier: string): Promise<RateLimitResult | null> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  if (redis) {
    try {
      const current = await redisHelper.get(key);

      if (!current) {
        return null;
      }

      const count = parseInt(current, 10);
      const ttlResult = await redisHelper.exists(key);
      const ttl = ttlResult && ttlResult > 0 ? ttlResult * 1000 : 0;

      return {
        success: count < 5,
        limit: 5,
        remaining: Math.max(0, 5 - count),
        resetTime: now + ttl,
      };
    } catch (error) {
      logger.error({ error, identifier }, 'Failed to get rate limit status from Redis');
    }
  }

  const entry = inMemoryStore.get(identifier);
  if (!entry) {
    return null;
  }

  return {
    success: entry.count < 5,
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


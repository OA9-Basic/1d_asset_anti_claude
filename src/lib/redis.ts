import Redis from 'ioredis';

import { createLogger } from '@/lib/logger';

const logger = createLogger('redis');

const redisUrl = process.env.REDIS_URL;

// Create Redis client if REDIS_URL is configured
// Otherwise, return null (in-memory fallback will be used)
export const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
      // Connection timeout
      connectTimeout: 10000,
      // Command timeout
      lazyConnect: false,
    })
  : null;

// Handle connection events
if (redis) {
  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('ready', () => {
    logger.info('Redis ready to accept commands');
  });

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', () => {
    logger.warn('Redis reconnecting');
  });
}

// Helper functions for Redis operations
export const redisHelper = {
  // Get value from Redis
  get: async (key: string): Promise<string | null> => {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error({ error, key }, 'Redis GET error');
      return null;
    }
  },

  // Set value in Redis with optional expiration (in seconds)
  set: async (key: string, value: string, ttl?: number): Promise<'OK' | null> => {
    if (!redis) return null;
    try {
      if (ttl) {
        return await redis.setex(key, ttl, value);
      }
      return await redis.set(key, value);
    } catch (error) {
      logger.error({ error, key, ttl }, 'Redis SET error');
      return null;
    }
  },

  // Delete key from Redis
  del: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Redis DEL error');
      return 0;
    }
  },

  // Delete all keys in current database
  flushdb: async (): Promise<'OK' | null> => {
    if (!redis) return null;
    try {
      return await redis.flushdb();
    } catch (error) {
      logger.error({ error }, 'Redis FLUSHDB error');
      return null;
    }
  },

  // Increment counter
  incr: async (key: string): Promise<number | null> => {
    if (!redis) return null;
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error({ error, key }, 'Redis INCR error');
      return null;
    }
  },

  // Increment counter by amount
  incrby: async (key: string, amount: number): Promise<number | null> => {
    if (!redis) return null;
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      logger.error({ error, key, amount }, 'Redis INCRBY error');
      return null;
    }
  },

  // Set multiple values
  mset: async (keyValuePairs: string[]): Promise<'OK' | null> => {
    if (!redis) return null;
    try {
      return await redis.mset(...keyValuePairs);
    } catch (error) {
      logger.error({ error }, 'Redis MSET error');
      return null;
    }
  },

  // Get multiple values
  mget: async (keys: string[]): Promise<(string | null)[] | null> => {
    if (!redis) return null;
    try {
      return await redis.mget(...keys);
    } catch (error) {
      logger.error({ error, keys }, 'Redis MGET error');
      return null;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.exists(key);
    } catch (error) {
      logger.error({ error, key }, 'Redis EXISTS error');
      return 0;
    }
  },

  // Set expiration time
  expire: async (key: string, seconds: number): Promise<boolean> => {
    if (!redis) return false;
    try {
      const result = await redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error({ error, key, seconds }, 'Redis EXPIRE error');
      return false;
    }
  },
};

// Export the redis instance and helper
export { redis as redisClient };
export default redis;

import Redis from 'ioredis';

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
    console.log('✅ Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready to accept commands');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  redis.on('close', () => {
    console.log('⚠️ Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('⚠️ Redis reconnecting...');
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
      console.error('Redis GET error:', error);
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
      console.error('Redis SET error:', error);
      return null;
    }
  },

  // Delete key from Redis
  del: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return 0;
    }
  },

  // Delete all keys in current database
  flushdb: async (): Promise<'OK' | null> => {
    if (!redis) return null;
    try {
      return await redis.flushdb();
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      return null;
    }
  },

  // Increment counter
  incr: async (key: string): Promise<number | null> => {
    if (!redis) return null;
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  },

  // Increment counter by amount
  incrby: async (key: string, amount: number): Promise<number | null> => {
    if (!redis) return null;
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('Redis INCRBY error:', error);
      return null;
    }
  },

  // Set multiple values
  mset: async (keyValuePairs: string[]): Promise<'OK' | null> => {
    if (!redis) return null;
    try {
      return await redis.mset(...keyValuePairs);
    } catch (error) {
      console.error('Redis MSET error:', error);
      return null;
    }
  },

  // Get multiple values
  mget: async (keys: string[]): Promise<(string | null)[] | null> => {
    if (!redis) return null;
    try {
      return await redis.mget(...keys);
    } catch (error) {
      console.error('Redis MGET error:', error);
      return null;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
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
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  },
};

// Export the redis instance and helper
export { redis as redisClient };
export default redis;

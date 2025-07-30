import Redis from 'ioredis';

// Redis client instance
let redis: Redis | null = null;

/**
 * Get Redis client instance (singleton pattern)
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Add SSL/TLS configuration for Redis Cloud
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      });

      redis.on('error', (error: any) => {
        console.error('Redis connection error:', error);
      });

      redis.on('connect', () => {
        console.log('✅ Connected to Redis Cloud');
      });

      redis.on('ready', () => {
        console.log('✅ Redis client ready');
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      throw new Error('Redis client initialization failed');
    }
  }

  return redis;
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

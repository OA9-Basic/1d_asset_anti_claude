import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiLogger } from '@/lib/loggers';

/**
 * Health Check Endpoint
 *
 * Provides application health status for monitoring and load balancers.
 *
 * Checks:
 * - Application is running
 * - Database connectivity
 * - Redis connectivity (if configured)
 *
 * Usage:
 * - GET /api/health - Basic health check
 * - GET /api/health?detailed=true - Detailed health check with all services
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  const url = new URL(req.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  const healthStatus = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: 0,
    checks: {} as Record<string, unknown>,
  };

  try {
    // Database Health Check
    const dbCheckStart = Date.now();
    try {
      await db.$queryRaw`SELECT 1`;
      healthStatus.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbCheckStart,
      };
    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error',
        responseTime: Date.now() - dbCheckStart,
      };
    }

    // Redis Health Check (if configured)
    if (process.env.REDIS_URL) {
      const redisCheckStart = Date.now();
      try {
        const { checkRateLimit } = await import('@/lib/rate-limit');
        // Use rate limit check as proxy for Redis health
        const result = checkRateLimit('health-check', { maxRequests: 100, windowMs: 60000 });
        healthStatus.checks.redis = {
          status: result.success ? 'healthy' : 'degraded',
          responseTime: Date.now() - redisCheckStart,
        };
      } catch (error) {
        healthStatus.checks.redis = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown Redis error',
          responseTime: Date.now() - redisCheckStart,
        };
        if (healthStatus.status === 'healthy') {
          healthStatus.status = 'degraded';
        }
      }
    }

    // Memory Usage Check
    const memoryUsage = process.memoryUsage();
    const memoryMb = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    // Warn if memory usage is high (>80% of heap)
    const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (heapUsagePercent > 80) {
      if (healthStatus.status === 'healthy') {
        healthStatus.status = 'degraded';
      }
    }

    if (detailed) {
      healthStatus.checks.memory = {
        ...memoryMb,
        heapUsagePercent: Math.round(heapUsagePercent),
        status: heapUsagePercent > 80 ? 'warning' : 'healthy',
      };
    }

    // Environment info
    if (detailed) {
      healthStatus.checks.environment = {
        nodeEnv: process.env.NODE_ENV || 'development',
        region: process.env.VERCEL_REGION || process.env.FLY_REGION || 'unknown',
        platform: process.platform,
        nodeVersion: process.version,
      };
    }

    healthStatus.responseTime = Date.now() - startTime;

    // Log health check results for monitoring
    apiLogger.debug('Health check completed', {
      status: healthStatus.status,
      responseTime: healthStatus.responseTime,
      checks: Object.keys(healthStatus.checks),
    });

    // Return appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    apiLogger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

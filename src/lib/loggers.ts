/**
 * Structured Logging Wrapper
 *
 * Provides consistent, structured logging throughout the application.
 * Extensible design for easy integration with external logging services.
 *
 * Features:
 * - Consistent log format across the application
 * - Log levels (debug, info, warn, error)
 * - Structured metadata support
 * - Console fallback in development for visibility
 * - Extensible for production monitoring services (Sentry, DataDog, etc.)
 *
 * @example
 * ```ts
 * import { apiLogger } from '@/lib/loggers';
 *
 * apiLogger.info('User logged in', { userId, ip });
 * apiLogger.error('Failed to create order', { error, cartId });
 * ```
 */

// eslint-disable-next-line import/no-named-as-default
import pino from 'pino';

// Log levels matching Pino standards
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Base logger interface
 * Provides structured logging with context
 */
export interface AppLogger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

/**
 * Create a logger instance with a specific context
 *
 * @param context - The context/module name for the logger
 * @returns A configured logger instance
 */
function createLoggerWithContext(context: string): AppLogger {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';

  // Base Pino logger configuration
  const pinoLogger = pino({
    level: logLevel,
    // Pretty print in development, JSON in production
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    // Include timestamp and context in all logs
    // eslint-disable-next-line import/no-named-as-default-member
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    // Base context added to all logs
    base: {
      context,
      environment: process.env.NODE_ENV || 'development',
    },
  });

  /**
   * Console fallback for development - ensures logs are ALWAYS visible
   * This is critical for debugging - Pino transports are async and may be lost
   */
  const consoleLog = (
    level: 'log' | 'info' | 'warn' | 'error',
    message: string,
    meta?: Record<string, unknown>
  ) => {
    if (isDevelopment) {
      const prefix = `[${context.toUpperCase()}]`;
      const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      // eslint-disable-next-line no-console -- Console logging in development is intentional
      console[level](`${prefix} ${message}${metaStr}`);
    }
  };

  // Return our wrapper interface with console fallback
  return {
    debug: (message: string, meta?: Record<string, unknown>) => {
      consoleLog('log', message, meta); // debug goes to console.log in dev
      pinoLogger.debug(meta || {}, message);
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      consoleLog('info', message, meta);
      pinoLogger.info(meta || {}, message);
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      consoleLog('warn', message, meta);
      pinoLogger.warn(meta || {}, message);
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      consoleLog('error', message, meta);
      pinoLogger.error(meta || {}, message);
    },
  };
}

// =============================================================================
// Pre-configured Loggers
// =============================================================================

/**
 * General API Logger
 * Use for API endpoint logging, request/response tracking
 */
export const apiLogger = createLoggerWithContext('api');

/**
 * Security Logger
 * Use for security-related events: auth failures, rate limiting, suspicious activity
 * IMPORTANT: In production, send these to a dedicated security monitoring system
 */
export const securityLogger = createLoggerWithContext('security');

/**
 * Database Logger
 * Use for database operations, query performance, connection issues
 */
export const dbLogger = createLoggerWithContext('database');

/**
 * Payment Logger
 * Use for payment processing, transactions, wallet operations
 * IMPORTANT: These logs are critical for financial audits
 */
export const paymentLogger = createLoggerWithContext('payment');

/**
 * Crypto Logger
 * Use for blockchain operations, wallet management, webhook processing
 */
export const cryptoLogger = createLoggerWithContext('crypto');

/**
 * Error Logger
 * Use for application errors, exceptions, crash reporting
 * In production, integrate with error tracking service (Sentry, etc.)
 */
export const errorLogger = createLoggerWithContext('error');

// =============================================================================
// Production Monitoring Integration (Extensibility)
// =============================================================================

/**
 * Configuration for external monitoring services
 * Uncomment and configure when integrating with external services
 */

/**
 * Sentry Integration Example
 *
 * To enable:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Uncomment the Sentry integration below
 */
/*
import * as Sentry from '@sentry/nextjs';

export function initSentryLogger() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export const sentryLogger: AppLogger = {
  debug: (message, meta) => {
    Sentry.addBreadcrumb({
      category: 'debug',
      message,
      level: 'debug',
      data: meta,
    });
  },
  info: (message, meta) => {
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
      data: meta,
    });
  },
  warn: (message, meta) => {
    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: { data: meta },
      tags: meta,
    });
  },
  error: (message, meta) => {
    Sentry.captureException(new Error(message), {
      contexts: { data: meta },
      tags: meta,
    });
  },
};
*/

/**
 * DataDog Integration Example
 *
 * To enable:
 * 1. Install: npm install dd-trace
 * 2. Configure DataDog agent
 * 3. Uncomment the DataDog integration below
 */
/*
import { tracer } from 'dd-trace';

export function initDataDogLogger() {
  tracer.init({
    service: 'digital-assets-marketplace',
    env: process.env.NODE_ENV,
    logInjection: true,
  });
}
*/

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a child logger with additional context
 *
 * @param parentLogger - The parent logger
 * @param childContext - Additional context to add to all logs
 * @returns A new logger with combined context
 */
export function createChildLogger(
  parentLogger: AppLogger,
  childContext: string
): AppLogger {
  const combinedContext = `${parentLogger}:${childContext}`;
  return createLoggerWithContext(combinedContext);
}

/**
 * Log with request context (IP, user agent, etc.)
 *
 * @param logger - The logger to use
 * @param request - Next.js Request object
 * @returns A logger function with request context pre-applied
 */
export function createRequestLogger(logger: AppLogger, request: Request) {
  const requestContext = {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
  };

  return {
    debug: (message: string, meta?: Record<string, unknown>) => {
      logger.debug(message, { ...requestContext, ...meta });
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      logger.info(message, { ...requestContext, ...meta });
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      logger.warn(message, { ...requestContext, ...meta });
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      logger.error(message, { ...requestContext, ...meta });
    },
  };
}

/**
 * Measure execution time of an async operation
 *
 * @param logger - The logger to use
 * @param operation - Name of the operation being measured
 * @param fn - The async function to measure
 * @returns The result of the function with timing logged
 */
export async function measureExecution<T>(
  logger: AppLogger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logger.debug(operation, {
      duration: `${duration}ms`,
      status: 'success',
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(operation, {
      duration: `${duration}ms`,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

// =============================================================================
// Export Default Logger (for backward compatibility)
// =============================================================================

/**
 * Default logger for general use
 * Prefer using the specific loggers above (apiLogger, securityLogger, etc.)
 */
export const logger = apiLogger;

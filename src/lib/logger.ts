/**
 * Structured Logging Configuration
 * Uses Pino for high-performance structured logging
 */

// eslint-disable-next-line import/no-named-as-default
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Log levels: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

export const logger = pino({
  level: logLevel,
  // Add default context fields
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  // Redact sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.mnemonic',
      'req.body.privateKey',
      'req.body.apiKey',
      'res.headers.authorization',
      'user.email',
      'user.phone',
    ],
    remove: true,
  },
  // Disable in test environment
  enabled: !isTest,
});

// Create child logger with additional context
export function createLogger(context: string) {
  return logger.child({ context });
}

// Convenience method for logging HTTP requests
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  logger.info({
    type: 'http_request',
    method,
    path,
    statusCode,
    duration,
    userId,
  });
}

// Convenience method for logging errors
export function logError(
  error: Error | unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
) {
  logger.error({
    type: 'error',
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    ...additionalInfo,
  });
}

// Convenience method for logging database operations
export function logDatabase(
  operation: string,
  model: string,
  duration: number,
  recordCount?: number
) {
  logger.debug({
    type: 'database',
    operation,
    model,
    duration,
    recordCount,
  });
}

// Convenience method for logging external API calls
export function logExternalApi(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) {
  logger.info({
    type: 'external_api',
    service,
    endpoint,
    method,
    statusCode,
    duration,
  });
}

export default logger;

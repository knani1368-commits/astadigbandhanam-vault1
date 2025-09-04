import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 * Logs all incoming requests with relevant metadata
 * Excludes sensitive data and secrets
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Skip logging for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Log request details
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  };

  // Add user ID if authenticated
  if (req.user && (req as any).user.id) {
    requestData['userId'] = (req as any).user.id;
  }

  logger.info('Incoming request', requestData);

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    const responseData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    // Log response
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', responseData);
    } else {
      logger.info('Request completed successfully', responseData);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

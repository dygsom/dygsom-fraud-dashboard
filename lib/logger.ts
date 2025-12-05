/**
 * Logging System
 *
 * Professional logging system with different levels and contexts.
 * Follows user requirement: "que se haga una buena gestion del log"
 *
 * All configuration from environment variables (no hardcoded values).
 */

import { LOG_CONFIG } from '@/config/constants';

// Simple development check
const isDevelopment = process.env.NODE_ENV === 'development';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private toConsole: boolean;

  constructor() {
    this.level = LOG_CONFIG.level;
    this.toConsole = LOG_CONFIG.toConsole;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log message with enhanced context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    let contextStr = '';
    
    if (context) {
      // Enhanced context formatting for better readability
      const formattedContext = this.formatContext(context);
      contextStr = ` | ${formattedContext}`;
    }
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Format context object for better logging
   */
  private formatContext(context: LogContext): string {
    try {
      // Handle special context types
      const formatted: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(context)) {
        if (value instanceof Error) {
          formatted[key] = {
            message: value.message,
            stack: value.stack,
            name: value.name,
          };
        } else if (value instanceof Date) {
          formatted[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          // Limit object depth to prevent circular references
          formatted[key] = this.limitObjectDepth(value, 2);
        } else {
          formatted[key] = value;
        }
      }
      
      return JSON.stringify(formatted, null, isDevelopment ? 2 : undefined);
    } catch (error) {
      return `[Context Error: ${error}]`;
    }
  }

  /**
   * Limit object depth to prevent circular references and massive logs
   */
  private limitObjectDepth(obj: any, maxDepth: number, currentDepth = 0): any {
    if (currentDepth >= maxDepth) {
      return '[Object: max depth reached]';
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.slice(0, 10).map(item => 
        this.limitObjectDepth(item, maxDepth, currentDepth + 1)
      );
    }
    
    const result: any = {};
    let keyCount = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      if (keyCount >= 20) { // Limit number of keys
        result['...'] = '[truncated]';
        break;
      }
      
      result[key] = this.limitObjectDepth(value, maxDepth, currentDepth + 1);
      keyCount++;
    }
    
    return result;
  }

  /**
   * Send log to external service (if configured)
   * This is a placeholder for future integration with logging services
   */
  private sendToExternalService(_level: LogLevel, _message: string, _context?: LogContext): void {
    // TODO: Implement external logging service integration
    // Examples: Sentry, LogRocket, Datadog, etc.
    // Only send in production
    if (!isDevelopment) {
      // External service integration here
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, context);

      if (this.toConsole) {
        console.debug(formatted);
      }

      this.sendToExternalService('debug', message, context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, context);

      if (this.toConsole) {
        console.info(formatted);
      }

      this.sendToExternalService('info', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, context);

      if (this.toConsole) {
        console.warn(formatted);
      }

      this.sendToExternalService('warn', message, context);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext: LogContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };

      const formatted = this.formatMessage('error', message, errorContext);

      if (this.toConsole) {
        console.error(formatted);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
      }

      this.sendToExternalService('error', message, errorContext);
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, duration?: number): void {
    const context: LogContext = {
      status,
      ...(duration && { duration: `${duration}ms` }),
    };

    if (status >= 200 && status < 300) {
      this.debug(`API Response: ${method} ${url}`, context);
    } else if (status >= 400) {
      this.warn(`API Response: ${method} ${url}`, context);
    }
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: Error | unknown): void {
    this.error(`API Error: ${method} ${url}`, error);
  }

  /**
   * Log authentication event
   */
  auth(event: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, context);
  }

  /**
   * Log navigation event
   */
  navigation(from: string, to: string): void {
    this.debug(`Navigation: ${from} → ${to}`);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Create a logger with a specific context
 * Useful for component-specific logging
 */
export function createLogger(defaultContext: LogContext): {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error | unknown, context?: LogContext) => void;
} {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(message, error, { ...defaultContext, ...context }),
  };
}

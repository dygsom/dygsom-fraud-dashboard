/**
 * Performance Monitoring
 *
 * Tracks and logs performance metrics for the application
 */

import { logger } from '@/lib/logger';

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.timers.set(name, startTime);
    
    logger.debug('Performance timer started', {
      timer: name,
      metadata,
      timestamp: Date.now(),
    });
  }

  /**
   * End timing an operation and log the result
   */
  end(name: string, metadata?: Record<string, any>): number | null {
    const endTime = performance.now();
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      logger.warn('Performance timer not found', { timer: name });
      return null;
    }
    
    const duration = endTime - startTime;
    this.timers.delete(name);
    
    const metrics: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };
    
    // Log performance based on duration
    const logContext = {
      operation: name,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: metrics.timestamp,
      metadata: metadata,
    };
    
    if (duration > 5000) {
      logger.error('Performance: Very slow operation detected', logContext);
    } else if (duration > 2000) {
      logger.warn('Performance: Slow operation detected', logContext);
    } else if (duration > 1000) {
      logger.info('Performance: Operation took longer than expected', logContext);
    } else {
      logger.debug('Performance: Operation completed', logContext);
    }
    
    return duration;
  }

  /**
   * Measure an async operation
   */
  async measure<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    
    try {
      const result = await operation();
      this.end(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.end(name, { 
        ...metadata, 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measureSync<T>(
    name: string, 
    operation: () => T, 
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    
    try {
      const result = operation();
      this.end(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.end(name, { 
        ...metadata, 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * Get Web Vitals if available
   */
  getWebVitals(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Observe Core Web Vitals
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            logger.info('Web Vitals metric', {
              name: entry.name,
              value: entry.startTime,
              rating: this.getRating(entry.name, entry.startTime),
              timestamp: Date.now(),
            });
          });
        });

        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        logger.warn('Performance Observer not supported', { error });
      }
    }
  }

  /**
   * Get performance rating based on Web Vitals thresholds
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      'largest-contentful-paint': [2500, 4000],
      'first-input-delay': [100, 300],
      'cumulative-layout-shift': [0.1, 0.25],
      'first-contentful-paint': [1800, 3000],
    };

    const [good, poor] = thresholds[metric] || [1000, 2000];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }
}

export const performanceMonitor = new PerformanceMonitor();
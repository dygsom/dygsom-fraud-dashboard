/**
 * Secure Storage Utility
 *
 * Wrapper around localStorage with error handling and type safety.
 * All keys from environment variables (no hardcoded values).
 */

import { logger } from './logger';

/**
 * Storage utility class
 */
class Storage {
  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      logger.warn('localStorage is not available');
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem<T = string>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      logger.error(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.error(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   */
  hasItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      logger.error(`Failed to check item in storage: ${key}`, error);
      return false;
    }
  }
}

// Singleton instance
export const storage = new Storage();

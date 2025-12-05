/**
 * Formatting Utilities
 *
 * Functions for formatting data for display using native JavaScript APIs
 */

/**
 * Format currency amount
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(0);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with commas
 *
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format percentage
 *
 * @param value - Decimal value (e.g., 0.125 for 12.5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date to readable string using native Date methods
 * @param date - Date string or Date object
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format date to relative time using native calculations
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "hace 2 horas")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'hace un momento'
  if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  if (diffDays < 30) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
  
  return dateObj.toLocaleDateString('es-ES')
}

/**
 * Format date and time using native Date methods
 * @param date - Date string or Date object
 * @returns Formatted date and time string (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Truncate string with ellipsis
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter of string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format risk score (0-100)
 *
 * @param score - Risk score
 * @returns Formatted score string
 */
export function formatRiskScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) {
    return '0/100';
  }
  return `${score.toFixed(0)}/100`;
}

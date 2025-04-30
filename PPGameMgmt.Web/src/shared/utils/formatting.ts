import { format, formatDistance, formatRelative, addDays } from 'date-fns';

/**
 * Format a date string to a standard display format
 * @param dateString ISO date string or Date object
 * @param formatStr Optional format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date | null | undefined, formatStr = 'MMM d, yyyy'): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string as a relative time from now (e.g., "2 days ago")
 * @param dateString ISO date string or Date object
 * @returns Formatted relative date string
 */
export const formatRelativeTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string as relative to another date
 * @param dateString ISO date string or Date object
 * @param baseDate Base date to calculate relative to
 * @returns Formatted relative date string
 */
export const formatDateRelativeTo = (
  dateString: string | Date | null | undefined, 
  baseDate: Date = new Date()
): string => {
  if (!dateString) return 'N/A';
  try {
    return formatRelative(new Date(dateString), baseDate);
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

/**
 * Format currency value with a currency symbol
 * @param value Number to format
 * @param currency Currency code (default: 'USD')
 * @param options NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | null | undefined, 
  currency = 'USD',
  options = {}
): string => {
  if (value === null || value === undefined) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      ...options
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${value}`;
  }
};

/**
 * Format a duration in seconds to a human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  }
  return `${minutes}m`;
};

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with thousands separators
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined, decimals = 0): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
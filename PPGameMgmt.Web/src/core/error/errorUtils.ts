/**
 * Consolidated error utilities for the application
 * This file replaces the duplicate error handling in shared/utils/errorHandling.ts
 */

import { AxiosError } from 'axios';
import { ApiError } from '../api/types';
import { ErrorCategory, ErrorDomain, handleApiError } from './globalErrorHandler';

/**
 * Standard error response format from backend
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, any>;
}

/**
 * Check if an error is a specific HTTP status code
 * @param error Error from API call
 * @param statusCode HTTP status code to check for
 * @returns Whether the error matches the status code
 */
export function isErrorWithStatus(error: unknown, statusCode: number): boolean {
  if (error instanceof ApiError) {
    return error.status === statusCode;
  }
  return error instanceof AxiosError && error.response?.status === statusCode;
}

/**
 * Check if an error is a network error (offline, timeout, etc.)
 * @param error Error from API call
 * @returns Whether the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return !error.status;
  }
  return error instanceof AxiosError && !error.response;
}

/**
 * Convert any error to an ApiError for consistent handling
 * @param error Any error object
 * @returns ApiError instance
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return new ApiError(
      data?.message || error.message || 'Network Error',
      error.response?.status || 0,
      { originalError: error, data: error.response?.data }
    );
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message, 0, { originalError: error });
  }
  
  return new ApiError(String(error) || 'Unknown error', 0, { originalError: error });
}

// Re-export the main error handler and types for convenience
export { handleApiError, ErrorCategory, ErrorDomain };

// Export a simplified version of handleApiError for backward compatibility
export function handleError(error: unknown, customMessage?: string): void {
  handleApiError(toApiError(error), customMessage);
}

export default handleApiError;

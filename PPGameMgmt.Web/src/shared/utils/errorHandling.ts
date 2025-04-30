/**
 * @deprecated This file is deprecated. Please import from 'src/core/error' instead.
 */

import {
  handleApiError,
  isErrorWithStatus,
  isNetworkError,
  toApiError,
  ApiErrorResponse
} from '../../core/error';

// Re-export for backward compatibility
export {
  handleApiError,
  isErrorWithStatus,
  isNetworkError
};

// Re-export types
export type { ApiErrorResponse };

/**
 * @deprecated Use the version from core/error instead
 */
export function getErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  return apiError.message;
}
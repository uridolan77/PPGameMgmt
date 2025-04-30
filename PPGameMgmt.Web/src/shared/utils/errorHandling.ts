import { toast } from 'sonner';
import { AxiosError } from 'axios';

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
 * Process API error and returns a standardized error message 
 * @param error Error from API call
 * @returns Standardized error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    
    // If server returned structured error data
    if (data?.message) {
      return data.message;
    }
    
    // Common HTTP status messages
    switch (error.response?.status) {
      case 400: return 'Invalid request data';
      case 401: return 'You need to login to access this resource';
      case 403: return 'You don\'t have permission to perform this action';
      case 404: return 'Resource not found';
      case 422: return 'Validation failed';
      case 429: return 'Too many requests, please try again later';
      case 500: return 'An unexpected error occurred on the server';
      default: return error.message || 'An unknown error occurred';
    }
  }
  
  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // For everything else
  return String(error) || 'An unknown error occurred';
}

/**
 * Standard error handler for API calls
 * @param error Error from API call
 * @param customMessage Optional custom error message
 */
export function handleApiError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  
  // Log to console for debugging
  console.error('API Error:', error);
  
  // Display toast notification to user
  toast.error(message);
}

/**
 * Check if an error is a specific HTTP status code
 * @param error Error from API call
 * @param statusCode HTTP status code to check for
 * @returns Whether the error matches the status code
 */
export function isErrorWithStatus(error: unknown, statusCode: number): boolean {
  return error instanceof AxiosError && error.response?.status === statusCode;
}

/**
 * Check if an error is a network error (offline, timeout, etc.)
 * @param error Error from API call
 * @returns Whether the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}
/**
 * Custom API error with enhanced properties
 */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Parse error from API response and return a standardized error object
 */
export const parseApiError = (error: any): ApiError => {
  // If it's already our custom error type, return it
  if (error instanceof ApiError) {
    return error;
  }
  
  // Handle various error formats from different sources
  if (error.response) {
    // Axios-style error
    const { data, status } = error.response;
    const message = data?.message || `API Error: ${status}`;
    return new ApiError(message, status, data);
  } else if (error.status && error.statusText) {
    // Fetch-style error
    return new ApiError(error.statusText, error.status);
  }
  
  // Generic error handling
  return new ApiError(
    error.message || 'Unknown API error', 
    error.status || 500
  );
};

/**
 * Get user-friendly error message based on error code and context
 */
export const getUserFriendlyErrorMessage = (error: unknown, context?: string): string => {
  const apiError = parseApiError(error);
  
  // Handle special status codes
  switch (apiError.status) {
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return context 
        ? `The requested ${context} could not be found.` 
        : 'The requested resource could not be found.';
    case 422:
      return 'The submitted data is invalid. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'A server error occurred. Please try again later.';
    default:
      return apiError.message || 'An unknown error occurred.';
  }
};
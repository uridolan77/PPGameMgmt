import { toast } from 'sonner';
import { ApiError } from '../api';
import { errorReportingService } from './ErrorBoundary';
import { logger } from '../logger';

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CONFLICT = 'conflict',
  BAD_REQUEST = 'bad_request',
  MAINTENANCE = 'maintenance',
  FEATURE_DISABLED = 'feature_disabled',
  UNKNOWN = 'unknown',
}

/**
 * Domain-specific error types for better error handling
 */
export enum ErrorDomain {
  GENERAL = 'general',
  PLAYER = 'player',
  GAME = 'game',
  BONUS = 'bonus',
  AUTH = 'auth',
  PAYMENT = 'payment',
  REPORTING = 'reporting',
  SETTINGS = 'settings',
  INTEGRATION = 'integration',
}

/**
 * Determine the error category based on the error
 */
export function getErrorCategory(error: ApiError): ErrorCategory {
  // Handle network errors (no status code)
  if (!error.status) {
    // Check for specific network error types
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      return ErrorCategory.TIMEOUT;
    }
    return ErrorCategory.NETWORK;
  }

  // Handle HTTP status codes
  switch (error.status) {
    case 400:
      return ErrorCategory.BAD_REQUEST;
    case 401:
      return ErrorCategory.AUTHENTICATION;
    case 403:
      return ErrorCategory.AUTHORIZATION;
    case 404:
      return ErrorCategory.NOT_FOUND;
    case 409:
      return ErrorCategory.CONFLICT;
    case 422:
      return ErrorCategory.VALIDATION;
    case 429:
      return ErrorCategory.RATE_LIMIT;
    case 500:
      return ErrorCategory.SERVER;
    case 502:
    case 503:
    case 504:
      // Check for maintenance mode
      if (error.message?.includes('maintenance') ||
          error.data?.reason === 'maintenance') {
        return ErrorCategory.MAINTENANCE;
      }
      return ErrorCategory.SERVER;
    default:
      return error.status >= 400 && error.status < 500
        ? ErrorCategory.CLIENT
        : ErrorCategory.SERVER;
  }
}

/**
 * Determine the error domain based on the error and context
 */
export function getErrorDomain(error: ApiError, context?: string): ErrorDomain {
  // Try to determine domain from the URL path
  const url = error.config?.url || '';

  if (url.includes('/players') || url.includes('/users')) {
    return ErrorDomain.PLAYER;
  }

  if (url.includes('/games')) {
    return ErrorDomain.GAME;
  }

  if (url.includes('/bonuses') || url.includes('/promotions')) {
    return ErrorDomain.BONUS;
  }

  if (url.includes('/auth') || url.includes('/login') || url.includes('/logout')) {
    return ErrorDomain.AUTH;
  }

  if (url.includes('/payments') || url.includes('/transactions')) {
    return ErrorDomain.PAYMENT;
  }

  if (url.includes('/reports') || url.includes('/analytics')) {
    return ErrorDomain.REPORTING;
  }

  if (url.includes('/settings') || url.includes('/config')) {
    return ErrorDomain.SETTINGS;
  }

  if (url.includes('/integrations') || url.includes('/api/external')) {
    return ErrorDomain.INTEGRATION;
  }

  // Try to determine domain from the context
  if (context) {
    const lowerContext = context.toLowerCase();

    if (lowerContext.includes('player') || lowerContext.includes('user')) {
      return ErrorDomain.PLAYER;
    }

    if (lowerContext.includes('game')) {
      return ErrorDomain.GAME;
    }

    if (lowerContext.includes('bonus') || lowerContext.includes('promotion')) {
      return ErrorDomain.BONUS;
    }

    if (lowerContext.includes('auth') || lowerContext.includes('login')) {
      return ErrorDomain.AUTH;
    }

    if (lowerContext.includes('payment') || lowerContext.includes('transaction')) {
      return ErrorDomain.PAYMENT;
    }

    if (lowerContext.includes('report') || lowerContext.includes('analytics')) {
      return ErrorDomain.REPORTING;
    }

    if (lowerContext.includes('setting') || lowerContext.includes('config')) {
      return ErrorDomain.SETTINGS;
    }

    if (lowerContext.includes('integration')) {
      return ErrorDomain.INTEGRATION;
    }
  }

  return ErrorDomain.GENERAL;
}

/**
 * Get a user-friendly error message based on the error
 */
export function getUserFriendlyMessage(error: ApiError | Error, context?: string): string {
  // If it's an API error, use its message or status
  if (error instanceof ApiError) {
    // Get the error domain for more specific messages
    const domain = getErrorDomain(error, context);
    const category = getErrorCategory(error);

    // If the error has a specific message from the API, use it
    if (error.data?.message) {
      return error.data.message;
    }

    // If the error has a message, use it
    if (error.message && !error.message.includes('Request failed with status code')) {
      return error.message;
    }

    // Generate domain-specific messages based on the error category
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return 'Your session has expired. Please log in again.';

      case ErrorCategory.AUTHORIZATION:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'You don\'t have permission to access this player information.';
          case ErrorDomain.GAME:
            return 'You don\'t have permission to manage games.';
          case ErrorDomain.BONUS:
            return 'You don\'t have permission to manage bonuses.';
          default:
            return 'You don\'t have permission to perform this action.';
        }

      case ErrorCategory.NOT_FOUND:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'The player could not be found.';
          case ErrorDomain.GAME:
            return 'The game could not be found.';
          case ErrorDomain.BONUS:
            return 'The bonus could not be found.';
          default:
            return `The requested ${context || 'resource'} could not be found.`;
        }

      case ErrorCategory.BAD_REQUEST:
        return 'The request contains invalid data. Please check your input.';

      case ErrorCategory.VALIDATION:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'Player validation failed. Please check the player information.';
          case ErrorDomain.GAME:
            return 'Game validation failed. Please check the game information.';
          case ErrorDomain.BONUS:
            return 'Bonus validation failed. Please check the bonus information.';
          default:
            return 'Validation failed. Please check your input.';
        }

      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please try again later.';

      case ErrorCategory.TIMEOUT:
        return 'The request timed out. Please try again later.';

      case ErrorCategory.CONFLICT:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'A conflict occurred with player data. The player may have been modified by another user.';
          case ErrorDomain.GAME:
            return 'A conflict occurred with game data. The game may have been modified by another user.';
          case ErrorDomain.BONUS:
            return 'A conflict occurred with bonus data. The bonus may have been modified by another user.';
          default:
            return 'A conflict occurred. The resource may have been modified by another user.';
        }

      case ErrorCategory.MAINTENANCE:
        return 'The system is currently undergoing maintenance. Please try again later.';

      case ErrorCategory.FEATURE_DISABLED:
        return 'This feature is currently disabled. Please try again later.';

      case ErrorCategory.SERVER:
        return 'A server error occurred. Please try again later.';

      default:
        return error.status >= 400 && error.status < 500
          ? 'There was a problem with your request.'
          : 'A server error occurred. Please try again later.';
    }
  }

  // For non-API errors, use the error message or a generic one
  return error.message || 'An unexpected error occurred.';
}

/**
 * Get recovery suggestions based on the error category and domain
 */
export function getRecoverySuggestion(category: ErrorCategory, domain: ErrorDomain = ErrorDomain.GENERAL): string {
  // Domain-specific recovery suggestions
  if (domain !== ErrorDomain.GENERAL) {
    switch (category) {
      case ErrorCategory.NOT_FOUND:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'Check the player ID or search for the player again.';
          case ErrorDomain.GAME:
            return 'Check the game ID or search for the game again.';
          case ErrorDomain.BONUS:
            return 'Check the bonus ID or search for the bonus again.';
          default:
            return 'The requested resource may have been moved or deleted.';
        }

      case ErrorCategory.VALIDATION:
        switch (domain) {
          case ErrorDomain.PLAYER:
            return 'Please check the player information and ensure all required fields are filled correctly.';
          case ErrorDomain.GAME:
            return 'Please check the game information and ensure all required fields are filled correctly.';
          case ErrorDomain.BONUS:
            return 'Please check the bonus information and ensure all required fields are filled correctly.';
          default:
            return 'Please review your input and try again.';
        }

      case ErrorCategory.CONFLICT:
        return 'Try refreshing the page to get the latest data before making changes.';
    }
  }

  // General recovery suggestions by category
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Check your internet connection and try again.';

    case ErrorCategory.TIMEOUT:
      return 'The server is taking too long to respond. Please try again later or contact support if the problem persists.';

    case ErrorCategory.AUTHENTICATION:
      return 'Please log in again to continue.';

    case ErrorCategory.AUTHORIZATION:
      return 'You may need additional permissions for this action. Contact your administrator.';

    case ErrorCategory.VALIDATION:
      return 'Please review your input and try again.';

    case ErrorCategory.NOT_FOUND:
      return 'The requested resource may have been moved or deleted.';

    case ErrorCategory.BAD_REQUEST:
      return 'Please check your input and try again.';

    case ErrorCategory.RATE_LIMIT:
      return 'You\'ve made too many requests. Please wait a moment before trying again.';

    case ErrorCategory.MAINTENANCE:
      return 'The system is currently undergoing maintenance. Please try again later.';

    case ErrorCategory.FEATURE_DISABLED:
      return 'This feature is currently disabled. Please contact your administrator for more information.';

    case ErrorCategory.SERVER:
      return 'Please try again later or contact support if the problem persists.';

    case ErrorCategory.CLIENT:
      return 'Please try again or contact support if the problem persists.';

    default:
      return 'Please try again later.';
  }
}

/**
 * Global error handler for API errors
 *
 * @param error The error to handle
 * @param context Optional context for the error (e.g., 'player', 'game')
 * @param options Additional options for error handling
 */
export function handleApiError(
  error: ApiError | Error,
  context?: string,
  options?: {
    showToast?: boolean;
    logError?: boolean;
    reportError?: boolean;
    toastDuration?: number;
    domain?: ErrorDomain;
  }
): void {
  const {
    showToast = true,
    logError = true,
    reportError = true,
    toastDuration = 5000,
    domain: explicitDomain,
  } = options || {};

  // Default to ApiError for consistent handling
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(error.message || 'Unknown error', 0, { originalError: error });

  // Get error category and domain
  const category = getErrorCategory(apiError);
  const domain = explicitDomain || getErrorDomain(apiError, context);

  // Get user-friendly messages
  const userMessage = getUserFriendlyMessage(apiError, context);
  const recoverySuggestion = getRecoverySuggestion(category, domain);

  // Log the error with domain information
  if (logError) {
    logger.error(`API Error (${category}, ${domain}):`, apiError);
  }

  // Report to error monitoring service in production
  if (reportError &&
      category !== ErrorCategory.VALIDATION &&
      category !== ErrorCategory.NOT_FOUND &&
      category !== ErrorCategory.BAD_REQUEST) {
    errorReportingService.captureError(apiError, {
      category,
      domain,
      context,
      url: window.location.href,
    });
  }

  // Show toast notification
  if (showToast) {
    const toastMessage = context
      ? `${context}: ${userMessage}`
      : userMessage;

    // Use different toast types based on error category
    switch (category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.BAD_REQUEST:
        toast.warning(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration
        });
        break;

      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        toast.error(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration,
        });
        break;

      case ErrorCategory.RATE_LIMIT:
      case ErrorCategory.TIMEOUT:
        toast.warning(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration,
        });
        break;

      case ErrorCategory.MAINTENANCE:
      case ErrorCategory.FEATURE_DISABLED:
        toast.info(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration,
        });
        break;

      case ErrorCategory.SERVER:
        toast.error(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration,
        });
        break;

      case ErrorCategory.NOT_FOUND:
        toast.warning(toastMessage, {
          description: recoverySuggestion,
          duration: toastDuration,
        });
        break;

      default:
        toast.error(toastMessage, { duration: toastDuration });
    }
  }

  // Special handling for specific error categories
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      break;

    case ErrorCategory.MAINTENANCE:
      // Show maintenance page
      if (window.location.pathname !== '/maintenance') {
        setTimeout(() => {
          window.location.href = '/maintenance';
        }, 2000);
      }
      break;
  }
}

/**
 * Check if an error is of a specific category
 */
export function isErrorOfCategory(error: ApiError | Error, category: ErrorCategory): boolean {
  if (!(error instanceof ApiError)) {
    return category === ErrorCategory.UNKNOWN;
  }

  return getErrorCategory(error) === category;
}

export default handleApiError;

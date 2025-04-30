import React, { Component, ErrorInfo as ReactErrorInfo, ReactNode } from 'react';
import { ErrorInfo } from './types';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '../logger';
import { config } from '../config';

// Helper function to collect additional context for error reporting
function getErrorContext() {
  return {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    environment: config.app.environment
  };
}

// Simple error reporting service interface
export interface ErrorReportingService {
  captureError: (error: Error, context?: Record<string, any>) => void;
  captureMessage: (message: string, context?: Record<string, any>) => void;
}

// Default error reporting service that logs to console in development
// and would integrate with a real reporting service in production
class DefaultErrorReportingService implements ErrorReportingService {
  captureError(error: Error, context?: Record<string, any>) {
    if (config.app.environment === 'development') {
      logger.error('Error captured by reporting service:', error, context);
      return;
    }
    
    // In production, we would send this to an error monitoring service
    // like Sentry, LogRocket, etc.
    // For now, just log it
    console.error('Error captured:', error, context);
    
    // Example of how this would be implemented with Sentry:
    // Sentry.captureException(error, { extra: context });
  }
  
  captureMessage(message: string, context?: Record<string, any>) {
    if (config.app.environment === 'development') {
      logger.warn('Message captured by reporting service:', message, context);
      return;
    }
    
    // In production, send to error monitoring service
    console.warn('Message captured:', message, context);
    
    // Example with Sentry:
    // Sentry.captureMessage(message, { extra: context });
  }
}

// Create a singleton instance
export const errorReportingService = new DefaultErrorReportingService();

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  showReset?: boolean;
  // New prop to disable error reporting if needed
  disableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ReactErrorInfo) {
    const errorInfo: ErrorInfo = {
      componentStack: info.componentStack
    };
    
    // Log the error locally
    logger.error('React error boundary caught an error:', error, errorInfo);
    
    // Send to error reporting service if enabled
    if (!this.props.disableReporting && config.app.environment !== 'test') {
      errorReportingService.captureError(error, {
        componentStack: info.componentStack,
        ...getErrorContext()
      });
    }
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          resetError={this.props.showReset ? this.handleReset : undefined} 
        />
      );
    }

    return this.props.children;
  }
}
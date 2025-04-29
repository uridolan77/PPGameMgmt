import React, { Component, ErrorInfo as ReactErrorInfo, ReactNode } from 'react';
import { ErrorInfo } from './types';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '../logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  showReset?: boolean;
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
    
    logger.error('React error boundary caught an error:', error, errorInfo);
    
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
          resetError={this.props.showReset ? this.handleReset : undefined} 
        />
      );
    }

    return this.props.children;
  }
}
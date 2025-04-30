import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface ErrorDisplayProps {
  error: Error | unknown;
  context?: string;
  onRetry?: () => void;
  variant?: 'default' | 'destructive' | 'outline';
  className?: string;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  context = 'data',
  onRetry,
  variant = 'destructive',
  className = '',
  showDetails = false,
}) => {
  // Convert unknown error to string message
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred';

  // Get the appropriate message based on context
  const contextMessage = `There was a problem loading the ${context}.`;

  return (
    <Alert variant={variant} className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        <div>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {contextMessage} {showDetails && errorMessage}
          </AlertDescription>
        </div>
      </div>
      
      {onRetry && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </Alert>
  );
};

// Export a typed version for API errors
export const ApiErrorDisplay: React.FC<ErrorDisplayProps> = (props) => {
  return <ErrorDisplay {...props} />;
};
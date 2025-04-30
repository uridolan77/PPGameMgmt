import React from 'react';
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserFriendlyErrorMessage } from '../../utils';

interface ApiErrorDisplayProps {
  error: unknown;
  context?: string;
  onRetry?: () => void;
}

/**
 * A reusable component for displaying API errors with an optional retry button
 */
export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ 
  error, 
  context,
  onRetry 
}) => {
  const errorMessage = getUserFriendlyErrorMessage(error, context);
  
  return (
    <Card className="border-destructive">
      <CardHeader className="text-destructive">
        <CardTitle className="flex items-center gap-2">
          <AlertCircleIcon className="h-5 w-5" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{errorMessage}</p>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

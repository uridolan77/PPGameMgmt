import React from 'react';
import { ErrorBoundary } from '../../../core/error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface FeatureErrorBoundaryProps {
  /**
   * The feature name to display in the error message
   */
  featureName: string;
  
  /**
   * The children to render
   */
  children: React.ReactNode;
  
  /**
   * Optional custom error message
   */
  errorMessage?: string;
  
  /**
   * Optional callback to handle errors
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether to show a reset button
   */
  showReset?: boolean;
  
  /**
   * Whether to disable error reporting
   */
  disableReporting?: boolean;
}

/**
 * A feature-level error boundary component that provides a consistent error UI
 * for feature modules.
 */
export const FeatureErrorBoundary: React.FC<FeatureErrorBoundaryProps> = ({
  featureName,
  children,
  errorMessage,
  onError,
  showReset = true,
  disableReporting = false,
}) => {
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    }
  };

  return (
    <ErrorBoundary
      disableReporting={disableReporting}
      showReset={showReset}
      onError={handleError}
      fallback={
        <Card className="w-full">
          <CardHeader className="bg-destructive/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Error in {featureName}</CardTitle>
            </div>
            <CardDescription>
              {errorMessage || `There was a problem loading the ${featureName} feature.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Please try refreshing the page or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {showReset && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardFooter>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default FeatureErrorBoundary;

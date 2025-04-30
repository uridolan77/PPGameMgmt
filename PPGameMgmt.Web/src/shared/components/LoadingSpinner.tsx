/**
 * @deprecated This component is deprecated. Please use LoadingIndicator instead.
 * This file exists for backward compatibility.
 */

import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  fullPage = false
}) => {
  const content = (
    <LoadingIndicator
      message={message}
      size="large"
      className={fullPage ? '' : 'p-6'}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        {content}
      </div>
    );
  }

  return content;
};
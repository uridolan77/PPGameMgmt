import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export type LoadingVariant = 'card' | 'detail' | 'table' | 'metrics' | 'custom';

export interface LoadingStateProps {
  variant?: LoadingVariant;
  count?: number;
  className?: string;
  customSkeletons?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'card',
  count = 1,
  className = '',
  customSkeletons
}) => {
  if (customSkeletons) {
    return <>{customSkeletons}</>;
  }

  return (
    <div className={`loading-state ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeletonVariant(variant)}
        </div>
      ))}
    </div>
  );
};

const renderSkeletonVariant = (variant: LoadingVariant) => {
  switch (variant) {
    case 'card':
      return (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      );
      
    case 'detail':
      return (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </>
      );
      
    case 'table':
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-between py-2 border-b last:border-0">
                <Skeleton className="h-5 w-full max-w-[180px]" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'metrics':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      );
      
    default:
      return <Skeleton className="h-40 w-full rounded-lg" />;
  }
};
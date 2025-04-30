import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Import the new component
import { StatusBadge as NewStatusBadge, StatusType } from '@/lib/ui/data-display';

export { StatusType };

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  label: string;
  dot?: boolean;
  variant?: 'default' | 'outline';
}

/**
 * @deprecated Use StatusBadge from @/lib/ui/data-display instead
 */
export const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
  // Log deprecation warning in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'The StatusBadge component from @/shared/components/ui-kit is deprecated. ' +
      'Please use StatusBadge from @/lib/ui/data-display instead.'
    );
  }
  
  // Pass through to new component
  return <NewStatusBadge {...props} />;
};
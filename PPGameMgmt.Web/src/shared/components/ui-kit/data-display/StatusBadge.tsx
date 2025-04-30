import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  label: string;
  dot?: boolean;
  variant?: 'default' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  dot = true,
  variant = 'default',
  className,
  ...props
}) => {
  // Status color mapping
  const statusStyles: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    error: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    info: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    default: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    pending: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
  };

  // Dot color mapping
  const dotStyles: Record<StatusType, string> = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-500',
    pending: 'bg-purple-500',
  };

  // Outline variant styles
  const outlineStyles: Record<StatusType, string> = {
    success: 'border-green-500 text-green-700 hover:bg-green-50',
    warning: 'border-yellow-500 text-yellow-700 hover:bg-yellow-50',
    error: 'border-red-500 text-red-700 hover:bg-red-50',
    info: 'border-blue-500 text-blue-700 hover:bg-blue-50',
    default: 'border-gray-500 text-gray-700 hover:bg-gray-50',
    pending: 'border-purple-500 text-purple-700 hover:bg-purple-50',
  };

  const styleClass = variant === 'outline' ? outlineStyles[status] : statusStyles[status];

  return (
    <Badge 
      variant={variant === 'outline' ? 'outline' : 'secondary'} 
      className={cn('font-medium flex items-center gap-1.5', styleClass, className)} 
      {...props}
    >
      {dot && (
        <span 
          className={cn('h-1.5 w-1.5 rounded-full', dotStyles[status])}
          aria-hidden="true"
        />
      )}
      {label}
    </Badge>
  );
};
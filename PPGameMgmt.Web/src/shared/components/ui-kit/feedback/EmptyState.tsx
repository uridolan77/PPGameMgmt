import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center border rounded-lg',
      compact ? 'p-4' : 'p-8',
      className
    )}>
      {icon && (
        <div className={cn(
          'rounded-full bg-muted flex items-center justify-center',
          compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'
        )}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-foreground',
        compact ? 'text-base' : 'text-lg'
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'mt-1 text-muted-foreground',
          compact ? 'text-sm max-w-xs' : 'max-w-sm'
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className={cn('flex gap-3 mt-4', compact ? 'flex-col sm:flex-row' : '')}>
          {action && (
            <Button
              onClick={action.onClick}
              size={compact ? 'sm' : 'default'}
              {...action.buttonProps}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              size={compact ? 'sm' : 'default'}
              {...secondaryAction.buttonProps}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
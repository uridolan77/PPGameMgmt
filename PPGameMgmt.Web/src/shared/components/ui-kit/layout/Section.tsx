import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  children,
  actions,
  className = '',
  contentClassName = '',
  headerClassName = '',
  id,
}) => {
  const hasHeader = title || description || actions;

  return (
    <section id={id} className={cn('space-y-4', className)}>
      {hasHeader && (
        <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4', headerClassName)}>
          <div className="space-y-1">
            {title && <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
};

// Specialized Section variants

export interface CardSectionProps extends Omit<SectionProps, 'contentClassName'> {
  cardClassName?: string;
  noPadding?: boolean;
  borderless?: boolean;
}

export const CardSection: React.FC<CardSectionProps> = ({ 
  cardClassName = '', 
  noPadding = false,
  borderless = false,
  ...props 
}) => {
  return (
    <Section 
      {...props} 
      contentClassName={cn(
        'bg-white dark:bg-slate-950 rounded-lg',
        !borderless && 'border',
        !noPadding && 'p-4 sm:p-6',
        cardClassName
      )} 
    />
  );
};
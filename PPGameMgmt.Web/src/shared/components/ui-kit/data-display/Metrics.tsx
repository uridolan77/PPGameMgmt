import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface MetricCardProps {
  title: string;
  value: string | number | ReactNode;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className = '',
  valueClassName = '',
  onClick,
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={cn('text-2xl font-bold mt-1', valueClassName)}>
              {value}
            </div>
            
            {trend && (
              <div className={cn('flex items-center mt-1 text-sm', trendColors[trend.direction])}>
                {trend.direction === 'up' && <span className="mr-1">↑</span>}
                {trend.direction === 'down' && <span className="mr-1">↓</span>}
                <span>{trend.value}%</span>
                {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
              </div>
            )}
            
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          
          {icon && (
            <div className="p-2 bg-muted rounded-md">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export interface MetricsGridProps {
  metrics: MetricCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 3,
  className = '',
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(`grid gap-4 ${columnClasses[columns]}`, className)}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
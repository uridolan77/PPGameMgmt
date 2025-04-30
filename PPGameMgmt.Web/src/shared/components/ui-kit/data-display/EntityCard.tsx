import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface EntityCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  fallbackImage?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  metadata?: Array<{ label: string; value: ReactNode }>;
  onClick?: () => void;
  className?: string;
  avatarClassName?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  description,
  imageSrc,
  fallbackImage,
  badge,
  actions,
  footer,
  metadata = [],
  onClick,
  className = '',
  avatarClassName = '',
}) => {
  const initials = title
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card 
      className={`${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        {(imageSrc || fallbackImage) && (
          <Avatar className={`h-12 w-12 ${avatarClassName}`}>
            <AvatarImage src={imageSrc} />
            <AvatarFallback>{fallbackImage || initials}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        
        {metadata.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {metadata.map((item, index) => (
              <div key={index} className="flex flex-col">
                <dt className="text-xs font-medium text-muted-foreground mb-1">{item.label}</dt>
                <dd className="text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
      
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};
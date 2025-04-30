import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  separator?: React.ReactNode;
  homeHref?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = '',
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  homeHref = '/',
}) => {
  // Create combined items with home if needed
  const breadcrumbItems = showHome 
    ? [{ label: 'Home', href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  return (
    <nav className={cn('flex items-center text-sm', className)} aria-label="Breadcrumbs">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center text-muted-foreground hover:text-foreground transition-colors',
                      item.icon && 'space-x-1'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className={cn('flex items-center font-medium', item.icon && 'space-x-1', isLast ? 'text-foreground' : 'text-muted-foreground')}>
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
              
              {!isLast && (
                <li className="flex items-center text-muted-foreground" aria-hidden="true">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
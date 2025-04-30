import React, { memo } from 'react';
import { Bonus } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '../../../../shared/utils/formatting';
import { formatBonusValue } from '../../utils/bonusUtils';
import { useRenderTracker } from '../../../../core/dev';
import { CalendarIcon, UsersIcon } from 'lucide-react';

interface BonusCardProps {
  bonus: Bonus;
  onClick?: (bonus: Bonus) => void;
  variant?: 'default' | 'compact';
}

/**
 * A card component for displaying bonus information
 * Memoized to prevent unnecessary re-renders
 */
export const BonusCard: React.FC<BonusCardProps> = ({
  bonus,
  onClick,
  variant = 'default'
}) => {
  // Track renders in development to help identify performance issues
  if (process.env.NODE_ENV === 'development') {
    useRenderTracker({ name: `BonusCard-${bonus.id}`, trackProps: true });
  }

  const handleClick = () => {
    if (onClick) onClick(bonus);
  };

  // Check if a bonus is expired
  const isBonusExpired = () => {
    const now = new Date();
    const endDate = new Date(bonus.endDate);
    return endDate < now;
  };

  // Get the appropriate badge variant based on bonus status
  const getBadgeVariant = () => {
    if (isBonusExpired()) return "destructive";
    return bonus.isActive ? "default" : "secondary";
  };

  // Get the appropriate badge text based on bonus status
  const getBadgeText = () => {
    if (isBonusExpired()) return "Expired";
    return bonus.isActive ? "Active" : "Inactive";
  };

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex-1">
          <div className="font-medium">{bonus.name}</div>
          <div className="text-sm text-muted-foreground">{formatBonusValue(bonus)}</div>
        </div>
        <Badge variant={getBadgeVariant()}>
          {getBadgeText()}
        </Badge>
      </div>
    );
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative pt-6 px-6">
        <div className="font-semibold text-lg">{bonus.name}</div>
        <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{bonus.description}</div>
        <div className="absolute top-3 right-3">
          <Badge variant={getBadgeVariant()}>
            {getBadgeText()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 pt-4">
        <div className="flex items-center justify-between mt-4">
          <Badge variant="outline" className="px-3 py-1 text-base">
            {formatBonusValue(bonus)}
          </Badge>

          {bonus.targetSegment && (
            <div className="flex items-center text-sm text-muted-foreground">
              <UsersIcon className="h-4 w-4 mr-1" />
              {bonus.targetSegment}
            </div>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mt-4">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>
            {formatDate(bonus.startDate)} - {formatDate(bonus.endDate)}
          </span>
        </div>

        <div className="mt-4 text-sm">
          <div className="text-muted-foreground">Claims</div>
          <div>
            {bonus.currentClaims}
            {bonus.maxClaims ? ` / ${bonus.maxClaims}` : ' (unlimited)'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Use memo to prevent unnecessary re-renders when props don't change
export default memo(BonusCard, (prevProps, nextProps) => {
  // Custom comparison function to determine if component should update
  return (
    prevProps.bonus.id === nextProps.bonus.id &&
    prevProps.bonus.isActive === nextProps.bonus.isActive &&
    prevProps.bonus.currentClaims === nextProps.bonus.currentClaims &&
    prevProps.variant === nextProps.variant
  );
});

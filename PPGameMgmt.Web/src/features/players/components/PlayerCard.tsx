import React, { memo } from 'react';
import { Player } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '../../../shared/utils/formatting';
import { useRenderTracker } from '../../../shared/hooks';

interface PlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  variant?: 'default' | 'compact';
}

/**
 * A card component for displaying player information
 * Memoized to prevent unnecessary re-renders
 */
export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onClick,
  variant = 'default'
}) => {
  // Track renders in development to help identify performance issues
  if (process.env.NODE_ENV === 'development') {
    useRenderTracker({ name: `PlayerCard-${player.id}`, trackProps: true });
  }

  const handleClick = () => {
    if (onClick) onClick(player);
  };

  // Get the appropriate badge variant based on player status
  const getBadgeVariant = () => {
    if (!player.isActive) return "destructive";
    if (player.segment === 'VIP') return "default";
    return "secondary";
  };

  // Get the appropriate badge text based on player status
  const getBadgeText = () => {
    if (!player.isActive) return "Inactive";
    if (player.segment) return player.segment;
    return "Active";
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (player.firstName && player.lastName) {
      return `${player.firstName[0]}${player.lastName[0]}`.toUpperCase();
    }
    return player.username.substring(0, 2).toUpperCase();
  };

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
        onClick={handleClick}
      >
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={player.avatarUrl} alt={player.username} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{player.username}</div>
          <div className="text-sm text-muted-foreground">{player.email}</div>
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
      <div className="relative pt-6 px-6 flex items-center">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={player.avatarUrl} alt={player.username} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-lg">{player.username}</div>
          <div className="text-sm text-muted-foreground">{player.email}</div>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={getBadgeVariant()}>
            {getBadgeText()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm mt-4">
          <div>
            <div className="text-muted-foreground">Player Level</div>
            <div>{player.playerLevel}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Joined</div>
            <div>{formatDate(player.registrationDate)}</div>
          </div>
          {player.country && (
            <div>
              <div className="text-muted-foreground">Country</div>
              <div>{player.country}</div>
            </div>
          )}
          {player.lastLoginDate && (
            <div>
              <div className="text-muted-foreground">Last Login</div>
              <div>{formatDate(player.lastLoginDate)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Use memo to prevent unnecessary re-renders when props don't change
export default memo(PlayerCard, (prevProps, nextProps) => {
  // Custom comparison function to determine if component should update
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.isActive === nextProps.player.isActive &&
    prevProps.player.playerLevel === nextProps.player.playerLevel &&
    prevProps.variant === nextProps.variant
  );
});

import React, { memo } from 'react';
import type { Game } from '../../types';
import { OptimizedImage } from '../../../../shared/components/OptimizedImage';
import { useRenderTracker } from '../../../../core/dev';

interface GameCardProps {
  game: Game;
  onClick?: (game: Game) => void;
  variant?: 'default' | 'compact';
  priority?: boolean; // Add priority prop for above-the-fold images
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onClick,
  variant = 'default',
  priority = false
}) => {
  // Track renders in development to help identify performance issues
  if (process.env.NODE_ENV === 'development') {
    useRenderTracker({ name: `GameCard-${game.id}`, trackProps: true });
  }

  const handleClick = () => {
    if (onClick) onClick(game);
  };

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        <OptimizedImage
          src={game.thumbnailUrl}
          alt={game.title}
          width={40}
          height={40}
          className="w-10 h-10 rounded mr-2"
          priority={priority}
        />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{game.title}</h4>
          <p className="text-xs text-gray-500">{game.provider}</p>
        </div>
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-1 ${game.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-gray-500">{game.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <OptimizedImage
          src={game.thumbnailUrl}
          alt={game.title}
          className="w-full h-40"
          width={320}
          height={160}
          priority={priority}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs rounded-full ${game.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {game.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{game.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{game.provider}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{game.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Released: {new Date(game.releaseDate).toLocaleDateString()}</span>
          <span>{game.category}</span>
        </div>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders when props don't change
export default memo(GameCard, (prevProps, nextProps) => {
  // Custom comparison function to determine if component should update
  return (
    prevProps.game.id === nextProps.game.id &&
    prevProps.game.isActive === nextProps.game.isActive &&
    prevProps.variant === nextProps.variant
  );
});

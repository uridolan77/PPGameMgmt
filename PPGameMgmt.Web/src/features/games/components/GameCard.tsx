import React from 'react';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onClick?: (game: Game) => void;
  variant?: 'default' | 'compact';
}

export const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  onClick,
  variant = 'default'
}) => {
  const handleClick = () => {
    if (onClick) onClick(game);
  };

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
        onClick={handleClick}
      >
        <img 
          src={game.thumbnailUrl} 
          alt={game.title} 
          className="w-10 h-10 rounded mr-2 object-cover"
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
        <img 
          src={game.thumbnailUrl} 
          alt={game.title}
          className="w-full h-40 object-cover"
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

export default GameCard;
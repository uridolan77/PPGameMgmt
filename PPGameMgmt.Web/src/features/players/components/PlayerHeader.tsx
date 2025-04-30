import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  MailIcon, 
  TagIcon
} from 'lucide-react';
import { Player } from '../types';
import { usePlayerActions } from '../hooks';

interface PlayerHeaderProps {
  player: Player;
  onDeletePlayer: () => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, onDeletePlayer }) => {
  const playerActions = usePlayerActions();

  // Generate a consistent color from a string for avatar
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };
  
  return (
    <div>
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => playerActions.goToPlayersList()}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Players
      </Button>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback 
              style={{ backgroundColor: getAvatarColor(player.username) }}
              className="text-2xl"
            >
              {player.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{player.username}</h1>
            <div className="flex items-center text-muted-foreground">
              <MailIcon className="h-4 w-4 mr-1" />
              <span>{player.email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => playerActions.goToPlayerEdit(player.id)}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={onDeletePlayer}
            disabled={playerActions.isDeleting}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            {playerActions.isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
      
      {/* Status badges */}
      <div className="flex gap-2 mt-4">
        <Badge variant={player.isActive ? "default" : "destructive"}>
          {player.isActive ? 'Active' : 'Inactive'}
        </Badge>
        
        <Badge variant="outline">
          Level {player.playerLevel}
        </Badge>
        
        {player.segment && (
          <Badge variant="secondary" className="flex items-center">
            <TagIcon className="h-3 w-3 mr-1" />
            {player.segment}
          </Badge>
        )}
      </div>
    </div>
  );
};
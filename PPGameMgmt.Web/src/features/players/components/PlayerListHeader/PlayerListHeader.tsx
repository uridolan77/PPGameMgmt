import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface PlayerListHeaderProps {
  title?: string;
  description?: string;
}

export const PlayerListHeader: React.FC<PlayerListHeaderProps> = ({
  title = 'Players',
  description = 'Manage and monitor all players on your platform'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      <Button onClick={() => navigate('/players/new')}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add New Player
      </Button>
    </div>
  );
};

export default PlayerListHeader;

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
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 page-header fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
          {description}
        </p>
      </div>
      <Button
        onClick={() => navigate('/players/new')}
        className="mui-style-button transition-all hover:shadow-md bg-primary hover:bg-primary/90 text-white px-4 py-2 h-9 self-start sm:self-auto rounded-md"
        size="default"
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Add New Player
      </Button>
    </div>
  );
};

export default PlayerListHeader;

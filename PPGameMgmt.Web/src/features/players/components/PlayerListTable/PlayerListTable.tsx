import React from 'react';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from '../../../../shared/components/VirtualizedList/VirtualizedList';
import { Player } from '../../types';

interface PlayerListTableProps {
  players: Player[];
  isLoading: boolean;
  isError: boolean;
  onRowClick: (player: Player) => void;
}

export const PlayerListTable: React.FC<PlayerListTableProps> = ({
  players,
  isLoading,
  isError,
  onRowClick
}) => {
  // Generate a consistent color from a string for avatar
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <div className="bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        <VirtualizedList
          items={players}
          height={500}
          estimateSize={60}
          isLoading={isLoading}
          isEmpty={players.length === 0}
          loadingComponent={
            <div className="h-24 flex items-center justify-center">
              Loading player data...
            </div>
          }
          emptyComponent={
            <div className="h-24 flex items-center justify-center">
              {isError ? (
                <span className="text-red-500">Error loading player data</span>
              ) : (
                <span>No players found</span>
              )}
            </div>
          }
          renderItem={(player) => (
            <div
              onClick={() => onRowClick(player)}
              className="cursor-pointer hover:bg-muted/50 border-b"
            >
              <div className="grid grid-cols-6 py-3">
                <div className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback style={{ backgroundColor: getAvatarColor(player.username) }}>
                        {player.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.username}</span>
                  </div>
                </div>
                <div className="px-4">{player.email}</div>
                <div className="px-4 text-center">
                  <Badge variant="outline">
                    Level {player.playerLevel}
                  </Badge>
                </div>
                <div className="px-4">
                  {player.segment ? (
                    <Badge variant="secondary">
                      {player.segment}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
                <div className="px-4">{formatDate(player.lastLogin)}</div>
                <div className="px-4 text-center">
                  <Badge variant={player.isActive ? "default" : "destructive"}>
                    {player.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default PlayerListTable;

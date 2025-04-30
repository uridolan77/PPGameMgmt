import React from 'react';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from '../../../../shared/components/VirtualizedList/VirtualizedList';
import { Player } from '../../types';
import { Card } from '@/components/ui/card';

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
    <Card className="mui-style-card data-table fade-in overflow-hidden border-none shadow-md">
      <div className="bg-background">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
            <TableRow>
              <TableHead className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Username</TableHead>
              <TableHead className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Email</TableHead>
              <TableHead className="text-center text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Level</TableHead>
              <TableHead className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Segment</TableHead>
              <TableHead className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Last Login</TableHead>
              <TableHead className="text-center text-xs font-medium uppercase text-slate-500 dark:text-slate-400 py-4">Status</TableHead>
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
            <div className="h-32 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="text-sm text-slate-500">Loading player data...</p>
              </div>
            </div>
          }
          emptyComponent={
            <div className="h-32 flex items-center justify-center">
              {isError ? (
                <div className="text-red-500 flex flex-col items-center">
                  <span className="text-lg mb-1">⚠️</span>
                  <span className="text-sm">Error loading player data</span>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <span className="text-lg mb-1">📋</span>
                  <span className="text-sm">No players found</span>
                </div>
              )}
            </div>
          }
          renderItem={(player: Player) => (
            <div
              onClick={() => onRowClick(player)}
              className="mui-style-table-row cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 transition-all duration-150"
            >
              <div className="grid grid-cols-6 py-2.5">
                <div className="px-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                      <AvatarFallback style={{ backgroundColor: getAvatarColor(player.username) }}>
                        {player.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{player.username}</span>
                  </div>
                </div>
                <div className="px-4 flex items-center text-sm text-slate-600 dark:text-slate-400">{player.email}</div>
                <div className="px-4 text-center flex items-center justify-center">
                  <Badge variant="outline" className="mui-style-badge text-xs bg-slate-50/50 dark:bg-slate-800/50 font-normal">
                    Level {player.playerLevel}
                  </Badge>
                </div>
                <div className="px-4 flex items-center">
                  {player.segment ? (
                    <Badge variant="secondary" className="mui-style-badge text-xs font-normal">
                      {player.segment}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">None</span>
                  )}
                </div>
                <div className="px-4 flex items-center text-sm text-slate-600 dark:text-slate-400">{formatDate(player.lastLogin)}</div>
                <div className="px-4 text-center flex items-center justify-center">
                  <Badge
                    variant={player.isActive ? "default" : "destructive"}
                    className="mui-style-badge text-xs font-normal"
                  >
                    {player.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default PlayerListTable;

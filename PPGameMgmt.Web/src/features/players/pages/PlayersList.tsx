import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks';
import { useStore } from '../../../core/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, SearchIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Player {
  id: number;
  username: string;
  email: string;
  playerLevel: number;
  isActive: boolean;
  segment?: string;
  lastLogin?: string;
}

const PlayersList: React.FC = () => {
  const navigate = useNavigate();
  const { data: players, isLoading, isError } = usePlayers();
  const { preferences } = useStore();
  const tablePreference = preferences.tablePreferences?.players;
  const [searchQuery, setSearchQuery] = useState('');

  const handleRowClick = (player: Player) => {
    navigate(`/players/${player.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Generate a consistent color from a string
  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  };

  const filteredPlayers = players?.filter(player => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.segment && player.segment.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Players</h1>
            <p className="text-muted-foreground">
              Manage and monitor all players on your platform
            </p>
          </div>
          <Button onClick={() => navigate('/players/new')}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Player
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Player Reports</CardTitle>
            <CardDescription>
              A comprehensive view of all player data across your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pb-4">
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-md border">
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
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading player data...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-red-500">
                        Error loading player data
                      </TableCell>
                    </TableRow>
                  ) : filteredPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No players found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlayers.map((player) => (
                      <TableRow 
                        key={player.id} 
                        onClick={() => handleRowClick(player)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback style={{ backgroundColor: getAvatarColor(player.username) }}>
                                {player.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>{player.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            Level {player.playerLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {player.segment ? (
                            <Badge variant="secondary">
                              {player.segment}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(player.lastLogin)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={player.isActive ? "success" : "destructive"}>
                            {player.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'} found
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayersList;
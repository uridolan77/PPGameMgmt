import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayersQueryV3 } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlayerListHeader,
  PlayerFilters,
  PlayerListTable,
  PlayerStats,
  PlayerPagination
} from '../components';
import { Player } from '../types';

const PlayersList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: players, isLoading, isError } = usePlayersQueryV3();

  // Stats for the overview tab
  const playerStats = useMemo(() => {
    if (!players) return {
      totalPlayers: 0,
      activePlayers: 0,
      newPlayers: 0,
      vipPlayers: 0
    };

    const totalPlayers = players.length;
    const activePlayers = players.filter(p => p.isActive).length;
    const vipPlayers = players.filter(p => p.segment === 'VIP').length;

    // Assume new players are those who registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // This is a placeholder - in a real app we'd use registrationDate
    const newPlayers = Math.floor(totalPlayers * 0.15); // 15% of total as a placeholder

    return {
      totalPlayers,
      activePlayers,
      newPlayers,
      vipPlayers
    };
  }, [players]);

  // Handle row click to navigate to player details
  const handleRowClick = (player: Player) => {
    navigate(`/players/${player.id}`);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting players as ${format}`);
    // Implementation would go here
  };

  // Memoize filtered players to avoid unnecessary re-filtering
  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    return players.filter(player =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.segment && player.segment.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [players, searchQuery]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-5">
        {/* Page Header */}
        <PlayerListHeader />

        {/* Player Statistics */}
        <PlayerStats
          totalPlayers={playerStats.totalPlayers}
          activePlayers={playerStats.activePlayers}
          newPlayers={playerStats.newPlayers}
          vipPlayers={playerStats.vipPlayers}
        />

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Player Reports</CardTitle>
            <CardDescription>
              A comprehensive view of all player data across your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="active">Active Players</TabsTrigger>
                <TabsTrigger value="inactive">Inactive Players</TabsTrigger>
                <TabsTrigger value="vip">VIP Players</TabsTrigger>
              </TabsList>

              {/* Search and Filters */}
              <PlayerFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onExport={handleExport}
              />

              {/* Player List Table */}
              <TabsContent value="overview">
                <PlayerListTable
                  players={filteredPlayers}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="active">
                <PlayerListTable
                  players={filteredPlayers.filter(p => p.isActive)}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="inactive">
                <PlayerListTable
                  players={filteredPlayers.filter(p => !p.isActive)}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="vip">
                <PlayerListTable
                  players={filteredPlayers.filter(p => p.segment === 'VIP')}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            <PlayerPagination
              totalItems={filteredPlayers.length}
              itemsPerPage={10}
              currentPage={1}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayersList;
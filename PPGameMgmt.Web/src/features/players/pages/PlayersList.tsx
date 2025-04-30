import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockPlayers } from '../hooks/useMockPlayers';
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
  const { data: players, isLoading, isError } = useMockPlayers();

  // Stats for the overview tab
  const playerStats = useMemo(() => {
    if (!players) return {
      totalPlayers: 0,
      activePlayers: 0,
      newPlayers: 0,
      vipPlayers: 0
    };

    const totalPlayers = players.length;
    const activePlayers = players.filter((p: Player) => p.isActive).length;
    const vipPlayers = players.filter((p: Player) => p.segment === 'VIP').length;

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

    return players.filter((player: Player) =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.segment && player.segment.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [players, searchQuery]);

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col gap-4">
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
        <Card className="mui-style-card fade-in border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <CardTitle className="text-base font-medium text-slate-800 dark:text-white">Player Reports</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
              A comprehensive view of all player data across your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mui-style-tabs">
              <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                <TabsTrigger
                  value="overview"
                  className="mui-style-tab data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-xs transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="mui-style-tab data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-xs transition-all"
                >
                  Active Players
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="mui-style-tab data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-xs transition-all"
                >
                  Inactive Players
                </TabsTrigger>
                <TabsTrigger
                  value="vip"
                  className="mui-style-tab data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-xs transition-all"
                >
                  VIP Players
                </TabsTrigger>
              </TabsList>

              {/* Search and Filters */}
              <PlayerFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onExport={handleExport}
              />

              {/* Player List Table */}
              <TabsContent value="overview" className="animate-tabContent mt-2">
                <PlayerListTable
                  players={filteredPlayers}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="active" className="animate-tabContent mt-2">
                <PlayerListTable
                  players={filteredPlayers.filter((p: Player) => p.isActive)}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="inactive" className="animate-tabContent mt-2">
                <PlayerListTable
                  players={filteredPlayers.filter((p: Player) => !p.isActive)}
                  isLoading={isLoading}
                  isError={isError}
                  onRowClick={handleRowClick}
                />
              </TabsContent>

              <TabsContent value="vip" className="animate-tabContent mt-2">
                <PlayerListTable
                  players={filteredPlayers.filter((p: Player) => p.segment === 'VIP')}
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
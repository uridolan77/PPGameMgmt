import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerGameSessions, usePlayerFeatures, usePlayerBonusClaims } from '../hooks';
import { useStore } from '../../../core/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerTabType } from '../types';
import {
  PlayerHeader,
  PlayerOverviewTab,
  PlayerGamesTab,
  PlayerBonusesTab,
  PlayerFeaturesTab
} from '../components';

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { ui } = useStore();
  const [activeTab, setActiveTab] = useState<PlayerTabType>('overview');
  
  // Convert id to number for API calls
  const playerId = id ? parseInt(id, 10) : undefined;

  // Fetch player data with proper error handling
  const { 
    data: player, 
    isLoading: playerLoading,
    error: playerError
  } = usePlayer(playerId);
  
  // Fetch related player data with dependency on player existence
  const { 
    data: gameSessions, 
    isLoading: sessionsLoading 
  } = usePlayerGameSessions(playerId);
  
  const { 
    data: features, 
    isLoading: featuresLoading 
  } = usePlayerFeatures(playerId);
  
  const { 
    data: bonusClaims, 
    isLoading: bonusesLoading 
  } = usePlayerBonusClaims(playerId);

  // Handle player deletion with confirmation
  const handleDeletePlayer = () => {
    // In a real app, this would show a confirmation dialog
    ui.addNotification({
      type: 'warning',
      message: 'This action would delete the player (demo only)',
      autoClose: true
    });
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as PlayerTabType);
  };

  // Render loading state
  if (playerLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  // Render error state
  if (playerError || !player) {
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-2xl font-bold text-destructive">
          {playerError ? 'Error loading player data' : 'Player not found'}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {playerError 
            ? 'There was an error loading this player. Please try again later.'
            : 'The requested player could not be found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* Player header with back button, avatar and actions */}
        <PlayerHeader player={player} onDeletePlayer={handleDeletePlayer} />

        {/* Tabs for player details */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Game History</TabsTrigger>
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <PlayerOverviewTab
              player={player}
              gameSessions={gameSessions}
              features={features}
              bonusClaims={bonusClaims}
              sessionsLoading={sessionsLoading}
              featuresLoading={featuresLoading}
              bonusesLoading={bonusesLoading}
            />
          </TabsContent>
          
          <TabsContent value="games">
            <PlayerGamesTab 
              gameSessions={gameSessions} 
              loading={sessionsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="bonuses">
            <PlayerBonusesTab 
              bonusClaims={bonusClaims} 
              loading={bonusesLoading} 
            />
          </TabsContent>
          
          <TabsContent value="features">
            <PlayerFeaturesTab 
              features={features} 
              loading={featuresLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerDetail;
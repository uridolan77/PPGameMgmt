import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerGameSessions, usePlayerFeatures, usePlayerBonusClaims, usePlayerActions } from '../hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerTabType } from '../types';
import {
  PlayerHeader,
  PlayerOverviewTab,
  PlayerGamesTab,
  PlayerBonusesTab,
  PlayerFeaturesTab,
  ApiErrorDisplay
} from '../components';

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<PlayerTabType>('overview');
  
  // Use our custom hook for player actions
  const playerActions = usePlayerActions();
  
  // Convert id to number for API calls
  const playerId = id ? parseInt(id, 10) : undefined;

  // Fetch player data with proper error handling
  const { 
    data: player, 
    isLoading: playerLoading,
    error: playerError,
    refetch: refetchPlayer
  } = usePlayer(playerId);
  
  // Fetch related player data with dependency on player existence
  const { 
    data: gameSessions, 
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions
  } = usePlayerGameSessions(playerId);
  
  const { 
    data: features, 
    isLoading: featuresLoading,
    error: featuresError,
    refetch: refetchFeatures
  } = usePlayerFeatures(playerId);
  
  const { 
    data: bonusClaims, 
    isLoading: bonusesLoading,
    error: bonusesError,
    refetch: refetchBonuses
  } = usePlayerBonusClaims(playerId);

  // Handle player deletion
  const handleDeletePlayer = () => {
    if (player) {
      playerActions.confirmDeletePlayer(player);
    }
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

  // Render error state using our ApiErrorDisplay component
  if (playerError || !player) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <ApiErrorDisplay 
          error={playerError || new Error('Player not found')}
          context="player"
          onRetry={refetchPlayer}
        />
      </div>
    );
  }

  // Function to get the appropriate error display for each tab
  const getTabErrorDisplay = (tabId: PlayerTabType) => {
    switch (tabId) {
      case 'games':
        return sessionsError ? 
          <ApiErrorDisplay 
            error={sessionsError} 
            context="game sessions" 
            onRetry={refetchSessions}
          /> : null;
      case 'features':
        return featuresError ? 
          <ApiErrorDisplay 
            error={featuresError} 
            context="player features" 
            onRetry={refetchFeatures}
          /> : null;
      case 'bonuses':
        return bonusesError ? 
          <ApiErrorDisplay 
            error={bonusesError} 
            context="bonus claims" 
            onRetry={refetchBonuses}
          /> : null;
      default:
        return null;
    }
  };

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
            {getTabErrorDisplay('games') || 
              <PlayerGamesTab 
                gameSessions={gameSessions} 
                loading={sessionsLoading} 
              />
            }
          </TabsContent>
          
          <TabsContent value="bonuses">
            {getTabErrorDisplay('bonuses') || 
              <PlayerBonusesTab 
                bonusClaims={bonusClaims} 
                loading={bonusesLoading} 
              />
            }
          </TabsContent>
          
          <TabsContent value="features">
            {getTabErrorDisplay('features') || 
              <PlayerFeaturesTab 
                features={features} 
                loading={featuresLoading} 
              />
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerDetail;
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerGameSessions, usePlayerFeatures, usePlayerBonusClaims, usePlayerActions } from '../hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerTabType } from '../types';
import { FeatureErrorBoundary } from '../../../shared/components/FeatureErrorBoundary';
import {
  PlayerHeader,
  PlayerDetailTabs
} from '../components';
import { ApiErrorDisplay } from '../../../shared/components';

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



  return (
    <FeatureErrorBoundary featureName="Player Details">
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          {/* Player header with back button, avatar and actions */}
          <PlayerHeader player={player} onDeletePlayer={handleDeletePlayer} />

          {/* Player detail tabs */}
          <PlayerDetailTabs
            player={player}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            gameSessions={gameSessions}
            features={features}
            bonusClaims={bonusClaims}
            sessionsLoading={sessionsLoading}
            featuresLoading={featuresLoading}
            bonusesLoading={bonusesLoading}
            sessionsError={sessionsError}
            featuresError={featuresError}
            bonusesError={bonusesError}
            refetchSessions={refetchSessions}
            refetchFeatures={refetchFeatures}
            refetchBonuses={refetchBonuses}
          />
        </div>
      </div>
    </FeatureErrorBoundary>
  );
};

export default PlayerDetail;
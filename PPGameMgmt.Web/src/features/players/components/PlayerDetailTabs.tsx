import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerTabType, Player, GameSession, PlayerFeature, BonusClaim } from '../types';
import {
  PlayerOverviewTab,
  PlayerGamesTab,
  PlayerBonusesTab,
  PlayerFeaturesTab
} from './';
import { ApiErrorDisplay } from '../../../shared/components';

interface PlayerDetailTabsProps {
  player: Player;
  activeTab: PlayerTabType;
  onTabChange: (tab: PlayerTabType) => void;
  gameSessions: GameSession[] | undefined;
  features: PlayerFeature[] | undefined;
  bonusClaims: BonusClaim[] | undefined;
  sessionsLoading: boolean;
  featuresLoading: boolean;
  bonusesLoading: boolean;
  sessionsError?: Error | null;
  featuresError?: Error | null;
  bonusesError?: Error | null;
  refetchSessions: () => void;
  refetchFeatures: () => void;
  refetchBonuses: () => void;
}

/**
 * A component that handles the tabs in the player detail page
 * This helps break down the complex PlayerDetail component
 */
export const PlayerDetailTabs: React.FC<PlayerDetailTabsProps> = ({
  player,
  activeTab,
  onTabChange,
  gameSessions,
  features,
  bonusClaims,
  sessionsLoading,
  featuresLoading,
  bonusesLoading,
  sessionsError,
  featuresError,
  bonusesError,
  refetchSessions,
  refetchFeatures,
  refetchBonuses
}) => {
  // Helper function to get error display for a specific tab
  const getTabErrorDisplay = (tab: PlayerTabType) => {
    switch (tab) {
      case 'games':
        return sessionsError ? (
          <ApiErrorDisplay
            error={sessionsError}
            onRetry={refetchSessions}
            context="game sessions"
          />
        ) : null;
      case 'bonuses':
        return bonusesError ? (
          <ApiErrorDisplay
            error={bonusesError}
            onRetry={refetchBonuses}
            context="bonus claims"
          />
        ) : null;
      case 'features':
        return featuresError ? (
          <ApiErrorDisplay
            error={featuresError}
            onRetry={refetchFeatures}
            context="player features"
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
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
  );
};

export default PlayerDetailTabs;

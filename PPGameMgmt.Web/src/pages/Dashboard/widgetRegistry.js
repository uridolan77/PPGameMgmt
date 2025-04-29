/**
 * Widget Registry
 * This file maps widget IDs to their component implementations
 */

// Import widget components
import PlayerStatsWidget from '../../components/dashboard/widgets/PlayerStatsWidget';
import GameStatsWidget from '../../components/dashboard/widgets/GameStatsWidget';
import TopGamesWidget from '../../components/dashboard/widgets/TopGamesWidget';
import BonusStatsWidget from '../../components/dashboard/widgets/BonusStatsWidget';
import RecentActivityWidget from '../../components/dashboard/widgets/RecentActivityWidget';
import PlayerSegmentsWidget from '../../components/dashboard/widgets/PlayerSegmentsWidget';
import GameRecommendationsWidget from '../../components/dashboard/widgets/GameRecommendationsWidget';
import BonusEffectivenessWidget from '../../components/dashboard/widgets/BonusEffectivenessWidget';
import PlayerRetentionWidget from '../../components/dashboard/widgets/PlayerRetentionWidget';

// Map widget IDs to their component implementations
const WIDGET_COMPONENTS = {
  playerStats: PlayerStatsWidget,
  gameStats: GameStatsWidget,
  topGames: TopGamesWidget,
  bonusStats: BonusStatsWidget,
  recentActivity: RecentActivityWidget,
  playerSegments: PlayerSegmentsWidget,
  gameRecommendations: GameRecommendationsWidget,
  bonusEffectiveness: BonusEffectivenessWidget,
  playerRetention: PlayerRetentionWidget
};

export default WIDGET_COMPONENTS;

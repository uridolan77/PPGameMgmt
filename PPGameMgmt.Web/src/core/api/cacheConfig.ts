/**
 * Centralized cache configuration for React Query
 * This replaces the duplicate cache key and stale time definitions across features
 */

import { DataCategory } from './reactQueryConfig';

/**
 * Standard stale times for different data types
 */
export const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
  SHORT: 1000 * 60 * 2,    // 2 minutes
  LONG: 1000 * 60 * 15,    // 15 minutes
  VERY_SHORT: 1000 * 30,   // 30 seconds
  VERY_LONG: 1000 * 60 * 60, // 1 hour
};

/**
 * Cache keys for all entity types
 * This centralizes all cache keys to avoid duplication and ensure consistency
 */
export const CACHE_KEYS = {
  // Player-related keys
  PLAYERS: 'players',
  PLAYER: 'player',
  PLAYER_FEATURES: 'player-features',
  PLAYER_GAME_SESSIONS: 'player-game-sessions',
  PLAYER_BONUS_CLAIMS: 'player-bonus-claims',
  
  // Game-related keys
  GAMES: 'games',
  GAME: 'game',
  GAME_STATS: 'game-stats',
  GAME_REVIEWS: 'game-reviews',
  
  // Bonus-related keys
  BONUSES: 'bonuses',
  BONUS: 'bonus',
  BONUS_STATS: 'bonus-stats',
  BONUS_CLAIMS: 'bonus-claims',
  BONUS_CLAIM: 'bonus-claim',
  
  // Auth-related keys
  AUTH: 'auth',
  USER: 'user',
  
  // Dashboard-related keys
  DASHBOARD: 'dashboard',
  DASHBOARD_STATS: 'dashboard-stats',
  
  // Recommendation-related keys
  RECOMMENDATIONS: 'recommendations',
};

/**
 * Get the appropriate stale time for a data category
 */
export function getStaleTime(category: DataCategory): number {
  switch (category) {
    case DataCategory.AUTH:
      return 0; // Always refetch auth data
    case DataCategory.USER:
    case DataCategory.DASHBOARD:
      return STALE_TIMES.VERY_SHORT; // 30 seconds
    case DataCategory.GAME:
    case DataCategory.PLAYER:
    case DataCategory.BONUS:
      return STALE_TIMES.STANDARD; // 5 minutes
    case DataCategory.RECOMMENDATION:
      return STALE_TIMES.SHORT; // 2 minutes
    case DataCategory.STATIC:
      return STALE_TIMES.VERY_LONG; // 1 hour
    default:
      return STALE_TIMES.STANDARD; // Default to 5 minutes
  }
}

/**
 * Get the appropriate cache time for a data category
 */
export function getCacheTime(category: DataCategory): number {
  switch (category) {
    case DataCategory.AUTH:
      return 1000 * 60 * 5; // 5 minutes
    case DataCategory.STATIC:
      return 1000 * 60 * 60 * 24; // 24 hours
    default:
      return 1000 * 60 * 30; // 30 minutes
  }
}

export default {
  CACHE_KEYS,
  STALE_TIMES,
  getStaleTime,
  getCacheTime,
};

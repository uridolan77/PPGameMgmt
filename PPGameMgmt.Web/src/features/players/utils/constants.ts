/**
 * Cache key constants for consistent query keys
 */
export const CACHE_KEYS = {
  ALL_PLAYERS: 'players',
  PLAYER: 'player',
  FEATURES: 'player-features',
  GAME_SESSIONS: 'player-game-sessions',
  BONUS_CLAIMS: 'player-bonus-claims'
};

/**
 * Stale time constants for cache management
 */
export const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
  SHORT: 1000 * 60 * 2,    // 2 minutes
  LONG: 1000 * 60 * 15     // 15 minutes
};

/**
 * Player segment values
 */
export const PLAYER_SEGMENTS = {
  VIP: 'vip',
  HIGH_ROLLER: 'high-roller',
  STANDARD: 'standard',
  NEW: 'new'
};

/**
 * Player status values
 */
export const PLAYER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};

/**
 * Badge variants for different bonus statuses
 */
export const BONUS_STATUS_VARIANTS = {
  ACTIVE: 'secondary',
  USED: 'default',
  EXPIRED: 'destructive'
} as const;
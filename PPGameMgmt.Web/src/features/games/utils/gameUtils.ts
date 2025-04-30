import { Game, GameCategory, GameStatus, GameFilter } from '../types';

/**
 * Formats a game object for display
 * @param game The game object to format
 * @returns Formatted game object
 */
export function formatGame(game: Game): Game {
  return {
    ...game,
    releaseDate: game.releaseDate ? new Date(game.releaseDate) : undefined,
    lastUpdated: game.lastUpdated ? new Date(game.lastUpdated) : new Date(),
  };
}

/**
 * Formats a game for API submission
 * @param game Game object to prepare for API submission
 * @returns Game object ready for API
 */
export function prepareGameForSubmission(game: Partial<Game>): Partial<Game> {
  return {
    ...game,
    // Convert date objects to ISO strings if they exist
    releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString() : undefined,
  };
}

/**
 * Get the status label for a game status
 * @param status Game status
 * @returns Human-readable status label
 */
export function getGameStatusLabel(status?: GameStatus): string {
  switch (status) {
    case GameStatus.ACTIVE:
      return 'Active';
    case GameStatus.INACTIVE:
      return 'Inactive';
    case GameStatus.COMING_SOON:
      return 'Coming Soon';
    case GameStatus.MAINTENANCE:
      return 'Under Maintenance';
    case GameStatus.DEPRECATED:
      return 'Deprecated';
    default:
      return 'Unknown';
  }
}

/**
 * Get a color code for a game status for UI purposes
 * @param status Game status
 * @returns Color code for the status
 */
export function getStatusColor(status?: GameStatus): string {
  switch (status) {
    case GameStatus.ACTIVE:
      return 'green';
    case GameStatus.INACTIVE:
      return 'gray';
    case GameStatus.COMING_SOON:
      return 'blue';
    case GameStatus.MAINTENANCE:
      return 'orange';
    case GameStatus.DEPRECATED:
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get category label for a game
 * @param category Game category
 * @returns Human-readable category label
 */
export function getGameCategoryLabel(category?: GameCategory): string {
  switch (category) {
    case GameCategory.SLOTS:
      return 'Slots';
    case GameCategory.TABLE_GAMES:
      return 'Table Games';
    case GameCategory.LIVE_DEALER:
      return 'Live Dealer';
    case GameCategory.POKER:
      return 'Poker';
    case GameCategory.LOTTERY:
      return 'Lottery';
    case GameCategory.SPECIALTY:
      return 'Specialty';
    default:
      return 'Unknown';
  }
}

/**
 * Build filter query params for games API
 * @param filter Game filter parameters
 * @returns Query params object for API
 */
export function buildGameFilterParams(filter: GameFilter = {}): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  
  if (filter.search) params.search = filter.search;
  if (filter.status !== undefined) params.status = filter.status;
  if (filter.category !== undefined) params.category = filter.category;
  if (filter.provider) params.provider = filter.provider;
  if (filter.minRtp !== undefined) params.minRtp = filter.minRtp;
  if (filter.maxRtp !== undefined) params.maxRtp = filter.maxRtp;
  if (filter.isPopular !== undefined) params.isPopular = filter.isPopular;
  if (filter.isNew !== undefined) params.isNew = filter.isNew;
  
  return params;
}

/**
 * Checks if a game is newly released (less than 30 days old)
 * @param game The game to check
 * @returns True if the game is considered new
 */
export function isNewGame(game: Game): boolean {
  if (!game.releaseDate) return false;
  
  const releaseDate = new Date(game.releaseDate);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return releaseDate >= thirtyDaysAgo;
}

/**
 * Sort games by a specific field
 * @param games Array of games to sort
 * @param field Field to sort by
 * @param direction Sort direction (asc or desc)
 * @returns Sorted array of games
 */
export function sortGames(
  games: Game[], 
  field: keyof Game = 'name', 
  direction: 'asc' | 'desc' = 'asc'
): Game[] {
  return [...games].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle dates
    if (field === 'releaseDate' || field === 'lastUpdated') {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }
    
    // Handle strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    // Handle numbers and booleans
    if (direction === 'asc') {
      return (valueA as any) > (valueB as any) ? 1 : -1;
    } else {
      return (valueA as any) < (valueB as any) ? 1 : -1;
    }
  });
}
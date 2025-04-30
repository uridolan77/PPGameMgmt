import { Game, GameCategory, GameStatus } from '../types';

/**
 * Generate a mock game for testing purposes
 * @param overrides Object with properties to override in the default mock game
 * @returns Mock game object
 */
export function mockGame(overrides: Partial<Game> = {}): Game {
  return {
    id: `game-${Math.floor(Math.random() * 10000)}`,
    name: 'Test Game',
    description: 'A game created for testing purposes',
    provider: 'Test Provider',
    category: GameCategory.SLOTS,
    status: GameStatus.ACTIVE,
    rtp: 96.5,
    volatility: 'medium',
    popularity: 0,
    releaseDate: new Date('2023-01-01').toISOString(),
    lastUpdated: new Date().toISOString(),
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    isPopular: false,
    isNew: true,
    ...overrides
  };
}

/**
 * Generate an array of mock games for testing
 * @param count Number of games to generate
 * @param baseOverrides Properties to override in all games
 * @returns Array of mock game objects
 */
export function mockGamesList(count: number, baseOverrides: Partial<Game> = {}): Game[] {
  return Array.from({ length: count }).map((_, index) => {
    return mockGame({
      id: `game-${index + 1}`,
      name: `Test Game ${index + 1}`,
      ...baseOverrides
    });
  });
}

/**
 * Generate a mock API response containing games
 * @param count Number of games to include
 * @param overrides Properties to override in the mock games
 * @returns Mock API response with games and pagination data
 */
export function mockGamesResponse(count: number, overrides: Partial<Game> = {}) {
  return {
    data: mockGamesList(count, overrides),
    pagination: {
      totalItems: count,
      totalPages: 1,
      currentPage: 1,
      pageSize: count
    }
  };
}
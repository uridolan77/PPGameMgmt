import { createApiHelpers } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { Game, GameFilter } from '../types';

/**
 * Game API service with methods to interact with the backend
 * Uses standardized createApiHelpers pattern for consistent API access
 */
export const gameApi = {
  /**
   * Get a list of games with optional filtering
   */
  getAll: (filters?: GameFilter) =>
    createApiHelpers.getList<Game>('games', DataCategory.GAME)(filters),

  /**
   * Get a single game by ID
   */
  getById: createApiHelpers.getOne<Game>('games', DataCategory.GAME),

  /**
   * Create a new game
   */
  create: createApiHelpers.create<Game, Omit<Game, 'id'>>('games'),

  /**
   * Update an existing game
   */
  update: createApiHelpers.update<Game, Partial<Game>>('games'),

  /**
   * Delete a game
   */
  remove: createApiHelpers.remove('games'),

  /**
   * Update game status (active/inactive)
   */
  updateStatus: (id: number, isActive: boolean) =>
    createApiHelpers.patch<Game>('games')(`${id}/status`, { isActive })
};

// For backward compatibility
export const gameService = gameApi;
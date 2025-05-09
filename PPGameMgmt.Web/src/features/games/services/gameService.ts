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
    createApiHelpers.getList<Game>('Games', DataCategory.GAME)(filters),

  /**
   * Get a single game by ID
   */
  getById: createApiHelpers.getOne<Game>('Games', DataCategory.GAME),

  /**
   * Create a new game
   */
  create: createApiHelpers.create<Game, Omit<Game, 'id'>>('Games'),

  /**
   * Update an existing game
   */
  update: createApiHelpers.update<Game, Partial<Game>>('Games'),

  /**
   * Delete a game
   */
  remove: createApiHelpers.remove('Games'),

  /**
   * Update game status (active/inactive)
   */
  updateStatus: (id: string, isActive: boolean) =>
    createApiHelpers.patch<Game>('Games')(`${id}/status`, { isActive })
};

// For backward compatibility
export const gameService = gameApi;
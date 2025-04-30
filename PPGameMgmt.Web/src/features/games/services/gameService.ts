import { apiClient } from '../../../core/api';
import { Game, GameFilter } from '../types';

const GAMES_ENDPOINT = '/games';

/**
 * Game API service with methods to interact with the backend
 */
export const gameService = {
  /**
   * Get a list of games with optional filtering
   */
  getGames: async (filters?: GameFilter): Promise<Game[]> => {
    const response = await apiClient.get(GAMES_ENDPOINT, { params: filters });
    return response.data;
  },

  /**
   * Get a single game by ID
   */
  getGame: async (id: number): Promise<Game> => {
    const response = await apiClient.get(`${GAMES_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Create a new game
   */
  createGame: async (gameData: Omit<Game, 'id'>): Promise<Game> => {
    const response = await apiClient.post(GAMES_ENDPOINT, gameData);
    return response.data;
  },

  /**
   * Update an existing game
   */
  updateGame: async (id: number, gameData: Partial<Game>): Promise<Game> => {
    const response = await apiClient.put(`${GAMES_ENDPOINT}/${id}`, gameData);
    return response.data;
  },

  /**
   * Update game status (active/inactive)
   */
  updateGameStatus: async (id: number, isActive: boolean): Promise<Game> => {
    const response = await apiClient.patch(`${GAMES_ENDPOINT}/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Delete a game
   */
  deleteGame: async (id: number): Promise<void> => {
    await apiClient.delete(`${GAMES_ENDPOINT}/${id}`);
  }
};
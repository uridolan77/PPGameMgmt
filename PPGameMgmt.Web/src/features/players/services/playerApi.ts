import { createApiHelpers } from '../../../core/api';
import { Player, PlayerFeature, GameSession, BonusClaim } from '../types';
import { apiClient } from '../../../core/api/client';

/**
 * Custom wrapper to handle the API response structure
 * The API returns an object with a 'value' property that contains the actual data
 */
const handleApiResponse = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const response = await promise;

    // Check if the response has a 'value' property (API response structure)
    if (response && typeof response === 'object' && 'value' in response) {
      console.log('API response has value property:', response);
      return response.value as T;
    }

    // If not, return the response directly
    console.log('API response direct:', response);
    return response as T;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

/**
 * Player API service with all player-related endpoints
 */
export const playerApi = {
  /**
   * Get all players with optional segment filtering
   */
  getAll: async (segment?: string): Promise<Player[]> => {
    try {
      console.log('Calling getAll with segment:', segment);

      const response = await apiClient.get<any>('/api/Players', {
        'api-version': '1.0',
        segment
      });

      console.log('Raw API response:', response);

      // Handle the API response structure
      if (response && typeof response === 'object') {
        // If response has a 'value' property that is an array
        if ('value' in response && Array.isArray(response.value)) {
          console.log('Found value array in response with length:', response.value.length);
          return response.value as Player[];
        }

        // If response has a 'data' property that is an array (common API wrapper pattern)
        if ('data' in response && Array.isArray(response.data)) {
          console.log('Found data array in response with length:', response.data.length);
          return response.data as Player[];
        }

        // If response has isSuccess and data properties (our API wrapper format)
        if ('isSuccess' in response && 'data' in response && Array.isArray(response.data)) {
          console.log('Found isSuccess/data format with length:', response.data.length);
          return response.data as Player[];
        }

        // If response itself is an array
        if (Array.isArray(response)) {
          console.log('Response is an array with length:', response.length);
          return response as Player[];
        }

        // If response has a single player object
        if ('id' in response && 'username' in response) {
          console.log('Response is a single player object');
          return [response] as Player[];
        }
      }

      // If we can't determine the structure, log and return an empty array
      console.error('Unexpected API response structure:', response);
      return [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  /**
   * Get a single player by ID
   */
  getById: async (id: number): Promise<Player> => {
    const response = await apiClient.get<any>(`/api/Players/${id}`, { 'api-version': '1.0' });

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as Player;
    }

    return response as Player;
  },

  /**
   * Create a new player
   */
  create: async (data: Omit<Player, 'id'>): Promise<Player> => {
    const response = await apiClient.post<any>(`/api/Players?api-version=1.0`, data);

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as Player;
    }

    return response as Player;
  },

  /**
   * Update an existing player
   */
  update: async (id: number, data: Partial<Player>): Promise<Player> => {
    const response = await apiClient.put<any>(`/api/Players/${id}?api-version=1.0`, data);

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as Player;
    }

    return response as Player;
  },

  /**
   * Delete a player
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete<any>(`/api/Players/${id}?api-version=1.0`);
  },

  /**
   * Get all features for a specific player
   */
  getFeatures: async (id: number): Promise<PlayerFeature[]> => {
    const response = await apiClient.get<any>(`/api/Players/${id}/features`, { 'api-version': '1.0' });

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as PlayerFeature[];
    }

    if (Array.isArray(response)) {
      return response as PlayerFeature[];
    }

    console.error('Unexpected API response structure for features:', response);
    return [];
  },

  /**
   * Get all game sessions for a specific player
   */
  getGameSessions: async (id: number): Promise<GameSession[]> => {
    const response = await apiClient.get<any>(`/api/Players/${id}/game-sessions`, { 'api-version': '1.0' });

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as GameSession[];
    }

    if (Array.isArray(response)) {
      return response as GameSession[];
    }

    console.error('Unexpected API response structure for game sessions:', response);
    return [];
  },

  /**
   * Get all bonus claims for a specific player
   */
  getBonusClaims: async (id: number): Promise<BonusClaim[]> => {
    const response = await apiClient.get<any>(`/api/Players/${id}/bonus-claims`, { 'api-version': '1.0' });

    // Handle the API response structure
    if (response && typeof response === 'object' && 'value' in response) {
      return response.value as BonusClaim[];
    }

    if (Array.isArray(response)) {
      return response as BonusClaim[];
    }

    console.error('Unexpected API response structure for bonus claims:', response);
    return [];
  }
};
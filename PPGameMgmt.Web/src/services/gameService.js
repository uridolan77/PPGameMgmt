import api from './api';

const gameService = {
  getAllGames: async () => {
    try {
      const response = await api.get('/games');
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  getGameById: async (id) => {
    try {
      const response = await api.get(`/games/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching game ${id}:`, error);
      throw error;
    }
  },

  createGame: async (gameData) => {
    try {
      const response = await api.post('/games', gameData);
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  updateGame: async (id, gameData) => {
    try {
      const response = await api.put(`/games/${id}`, gameData);
      return response.data;
    } catch (error) {
      console.error(`Error updating game ${id}:`, error);
      throw error;
    }
  },

  deleteGame: async (id) => {
    try {
      await api.delete(`/games/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting game ${id}:`, error);
      throw error;
    }
  },

  getGameSessions: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/sessions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for game ${gameId}:`, error);
      throw error;
    }
  },

  getGamePopularityStats: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/popularity-stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching popularity stats for game ${gameId}:`, error);
      throw error;
    }
  },

  getGameRevenueStats: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/revenue-stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching revenue stats for game ${gameId}:`, error);
      throw error;
    }
  }
};

export default gameService;
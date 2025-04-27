import api from './api';

const playerService = {
  getAllPlayers: async () => {
    try {
      const response = await api.get('/players');
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  getPlayerById: async (id) => {
    try {
      const response = await api.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching player ${id}:`, error);
      throw error;
    }
  },

  createPlayer: async (playerData) => {
    try {
      const response = await api.post('/players', playerData);
      return response.data;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  updatePlayer: async (id, playerData) => {
    try {
      const response = await api.put(`/players/${id}`, playerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating player ${id}:`, error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      await api.delete(`/players/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting player ${id}:`, error);
      throw error;
    }
  },

  getPlayerFeatures: async (playerId) => {
    try {
      const response = await api.get(`/players/${playerId}/features`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching features for player ${playerId}:`, error);
      throw error;
    }
  },

  getPlayerGameHistory: async (playerId) => {
    try {
      const response = await api.get(`/players/${playerId}/game-history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching game history for player ${playerId}:`, error);
      throw error;
    }
  },

  getPlayerBonuses: async (playerId) => {
    try {
      const response = await api.get(`/players/${playerId}/bonuses`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bonuses for player ${playerId}:`, error);
      throw error;
    }
  }
};

export default playerService;
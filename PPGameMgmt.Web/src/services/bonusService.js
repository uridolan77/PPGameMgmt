import api from './api';

const bonusService = {
  getAllBonuses: async () => {
    try {
      const response = await api.get('/bonuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      throw error;
    }
  },

  getBonusById: async (id) => {
    try {
      const response = await api.get(`/bonuses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bonus ${id}:`, error);
      throw error;
    }
  },

  createBonus: async (bonusData) => {
    try {
      const response = await api.post('/bonuses', bonusData);
      return response.data;
    } catch (error) {
      console.error('Error creating bonus:', error);
      throw error;
    }
  },

  updateBonus: async (id, bonusData) => {
    try {
      const response = await api.put(`/bonuses/${id}`, bonusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating bonus ${id}:`, error);
      throw error;
    }
  },

  deleteBonus: async (id) => {
    try {
      await api.delete(`/bonuses/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting bonus ${id}:`, error);
      throw error;
    }
  },

  claimBonus: async (bonusId, playerId) => {
    try {
      const response = await api.post(`/bonuses/${bonusId}/claim`, { playerId });
      return response.data;
    } catch (error) {
      console.error(`Error claiming bonus ${bonusId} for player ${playerId}:`, error);
      throw error;
    }
  },

  getBonusStats: async (bonusId) => {
    try {
      const response = await api.get(`/bonuses/${bonusId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for bonus ${bonusId}:`, error);
      throw error;
    }
  },

  getActiveBonuses: async () => {
    try {
      const response = await api.get('/bonuses/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active bonuses:', error);
      throw error;
    }
  }
};

export default bonusService;
import api from './api';

const recommendationService = {
  getRecommendationsForPlayer: async (playerId) => {
    try {
      const response = await api.get(`/recommendations/player/${playerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recommendations for player ${playerId}:`, error);
      throw error;
    }
  },

  getRecommendationById: async (id) => {
    try {
      const response = await api.get(`/recommendations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recommendation ${id}:`, error);
      throw error;
    }
  },

  createRecommendation: async (recommendationData) => {
    try {
      const response = await api.post('/recommendations', recommendationData);
      return response.data;
    } catch (error) {
      console.error('Error creating recommendation:', error);
      throw error;
    }
  },

  updateRecommendation: async (id, recommendationData) => {
    try {
      const response = await api.put(`/recommendations/${id}`, recommendationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating recommendation ${id}:`, error);
      throw error;
    }
  },

  deleteRecommendation: async (id) => {
    try {
      await api.delete(`/recommendations/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting recommendation ${id}:`, error);
      throw error;
    }
  },

  generateRecommendations: async (parameters) => {
    try {
      const response = await api.post('/recommendations/generate', parameters);
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  },

  getRecommendationPerformance: async (id) => {
    try {
      const response = await api.get(`/recommendations/${id}/performance`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recommendation performance data for ${id}:`, error);
      throw error;
    }
  }
};

export default recommendationService;
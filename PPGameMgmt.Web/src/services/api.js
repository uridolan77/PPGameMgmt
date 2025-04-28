import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and force re-login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Enhance error with a friendly message
    if (error.response && error.response.data) {
      error.friendlyMessage = error.response.data.message || 'Something went wrong. Please try again.';
    } else if (error.request) {
      error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      error.friendlyMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Define API service for Players
export const playerApi = {
  getAll: () => api.get('/players'),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
  getFeatures: (id) => api.get(`/players/${id}/features`),
  getGameSessions: (id) => api.get(`/players/${id}/gamesessions`),
  getBonusClaims: (id) => api.get(`/players/${id}/bonusclaims`)
};

// Define API service for Games
export const gameApi = {
  getAll: () => api.get('/games'),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  getTopGames: () => api.get('/games/top'),
  getByCategory: (category) => api.get(`/games/category/${category}`)
};

// Define API service for Bonuses
export const bonusApi = {
  getAll: () => api.get('/bonuses'),
  getById: (id) => api.get(`/bonuses/${id}`),
  create: (data) => api.post('/bonuses', data),
  update: (id, data) => api.put(`/bonuses/${id}`, data),
  delete: (id) => api.delete(`/bonuses/${id}`),
  getActive: () => api.get('/bonuses/active'),
  claim: (playerId, bonusId) => api.post(`/bonuses/${bonusId}/claim`, { playerId })
};

// Define API service for Recommendations
export const recommendationApi = {
  getForPlayer: (playerId) => api.get(`/recommendations/player/${playerId}`),
  getGameRecommendations: (playerId) => api.get(`/recommendations/player/${playerId}/games`),
  getBonusRecommendations: (playerId) => api.get(`/recommendations/player/${playerId}/bonuses`)
};

export default api;
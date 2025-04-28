import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of pending requests
let refreshSubscribers = [];

// Helper function to add callbacks to the queue
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper function to execute all callbacks in the queue with the new token
const onRefreshed = (token) => {
  refreshSubscribers.map(callback => callback(token));
  refreshSubscribers = [];
};

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
      refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return accessToken;
  } catch (error) {
    // If refresh token is invalid, force logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
};

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

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not a retry and not a token refresh request
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url?.includes('auth/refresh-token')) {
      
      if (isRefreshing) {
        // Wait for token to be refreshed
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Notify all subscribers that token has been refreshed
          onRefreshed(newToken);
          
          // Try original request again with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } else {
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
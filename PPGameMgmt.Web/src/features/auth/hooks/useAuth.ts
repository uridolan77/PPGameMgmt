import { LoginCredentials, User } from '../types';
import { useState, useEffect } from 'react';
import mockAuthService from '../services/mockAuthService';

// Local storage keys
const USER_KEY = 'auth_user';
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/**
 * Hook for accessing authentication state and methods
 * This version uses a mock implementation since the store auth functions are not available
 */
export const useAuth = () => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist auth state to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, [refreshToken]);

  // Return mock auth implementation
  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Methods
    login: async (credentials: LoginCredentials) => {
      console.log('Mock login called with:', credentials);
      setIsLoading(true);
      setError(null);

      try {
        // Use mock service
        const response = await mockAuthService.login(credentials);

        // Update state
        setUser(response.user);
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setIsLoading(false);

        return response;
      } catch (err) {
        // Handle error
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },

    logout: async () => {
      setIsLoading(true);

      try {
        // Use mock service
        await mockAuthService.logout();

        // Clear state
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        // Handle error
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },

    refreshAuth: async () => {
      if (!refreshToken) {
        return false;
      }

      setIsLoading(true);

      try {
        // Use mock service
        const response = await mockAuthService.refreshToken(refreshToken);

        // Update tokens
        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setIsLoading(false);

        return true;
      } catch (err) {
        // Handle error
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);

        // Clear auth state on refresh failure
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        return false;
      }
    }
  };
};

export default useAuth;
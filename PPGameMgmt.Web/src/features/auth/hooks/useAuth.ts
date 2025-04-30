import { LoginCredentials, User } from '../types';
import { useState } from 'react';
import mockAuthService from '../services/mockAuthService';

/**
 * Hook for accessing authentication state and methods
 * This version uses a mock implementation since the store auth functions are not available
 */
export const useAuth = () => {
  // Local state for auth
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
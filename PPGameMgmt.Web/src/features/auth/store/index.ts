import { StateCreator } from 'zustand';
import { AuthState, LoginCredentials } from '../types';
import authService from '../services/authService';
import { apiClient } from '../../../core/api';
import { RootState } from '../../../core/store/types';

export const createAuthSlice: StateCreator<
  RootState,
  [],
  [],
  { auth: AuthState }
> = (set, get) => ({
  auth: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    
    login: async (credentials: LoginCredentials) => {
      set((state) => ({ 
        auth: { 
          ...state.auth, 
          isLoading: true, 
          error: null 
        }
      }));
      
      try {
        const response = await authService.login(credentials);
        
        // Set the auth token for future API requests
        apiClient.setAuthToken(response.accessToken);
        
        set((state) => ({
          auth: {
            ...state.auth,
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null
          }
        }));
      } catch (error) {
        set((state) => ({
          auth: {
            ...state.auth,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          }
        }));
      }
    },
    
    logout: async () => {
      try {
        // Attempt to call logout API if user is logged in
        if (get().auth.accessToken) {
          await authService.logout();
        }
      } catch (error) {
        // Even if API call fails, we still want to clear local auth state
        console.error('Logout API call failed:', error);
      } finally {
        // Clear auth token from API client
        apiClient.setAuthToken(null);
        
        // Reset auth state
        set((state) => ({
          auth: {
            ...state.auth,
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null
          }
        }));
      }
    },
    
    refreshAuth: async () => {
      const { refreshToken } = get().auth;
      
      if (!refreshToken) {
        return false;
      }
      
      try {
        const response = await authService.refreshToken(refreshToken);
        
        // Update auth token for API requests
        apiClient.setAuthToken(response.accessToken);
        
        set((state) => ({
          auth: {
            ...state.auth,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          }
        }));
        
        return true;
      } catch (error) {
        // If refresh fails, logout
        get().auth.logout();
        return false;
      }
    }
  }
});
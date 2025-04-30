import { apiClient } from '../../../core/api';
import { User, LoginCredentials } from '../types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication API service with methods to interact with the backend
 * Uses standardized createApiHelpers pattern for consistent API access
 */
export const authApi = {
  /**
   * Login with credentials
   */
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/auth/login', credentials),

  /**
   * Logout the current user
   */
  logout: () =>
    apiClient.post<void>('/auth/logout'),

  /**
   * Refresh the authentication token
   */
  refreshToken: (refreshToken: string) =>
    apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken }),

  /**
   * Get the current authenticated user
   */
  getCurrentUser: () =>
    apiClient.get<User>('/auth/me')
};

// For backward compatibility
const authService = authApi;
export default authService;
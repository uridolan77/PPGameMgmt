/**
 * Authentication related types
 */

// User model
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Login response
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Auth state in the store
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

import { LoginCredentials, LoginResponse, User } from '../types';

/**
 * Mock authentication service for development and testing
 * This can be used when the real auth service is not available
 */
export const mockAuthService = {
  /**
   * Mock login function
   * @param credentials User credentials
   * @returns A promise that resolves to a mock login response
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login for specific test credentials
    if (credentials.username === 'admin' && credentials.password === 'password') {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin'],
        permissions: ['read', 'write', 'delete'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };
    }
    
    // Mock failed login for any other credentials
    throw new Error('Invalid username or password');
  },
  
  /**
   * Mock logout function
   * @returns A promise that resolves when logout is complete
   */
  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Nothing to do for mock logout
    return;
  },
  
  /**
   * Mock refresh token function
   * @param refreshToken The refresh token
   * @returns A promise that resolves to a mock refresh token response
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful token refresh
    if (refreshToken === 'mock-refresh-token') {
      return {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token'
      };
    }
    
    // Mock failed token refresh
    throw new Error('Invalid refresh token');
  },
  
  /**
   * Mock get current user function
   * @returns A promise that resolves to a mock user
   */
  getCurrentUser: async (): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data
    return {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin'],
      permissions: ['read', 'write', 'delete'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

export default mockAuthService;

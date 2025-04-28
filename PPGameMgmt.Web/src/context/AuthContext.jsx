import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    // Check if there is a stored token on initial load
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      
      if (accessToken && refreshToken && storedUser) {
        try {
          // Check if token is expired
          if (isTokenExpired(accessToken)) {
            // Try to refresh the token
            try {
              const response = await api.post('/auth/refresh-token', {
                refreshToken
              });
              
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
              
              localStorage.setItem('authToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
            } catch (refreshError) {
              // If refresh fails, clear tokens and user
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setLoading(false);
              return;
            }
          }
          
          // Set user state if tokens are valid
          setCurrentUser(JSON.parse(storedUser));
        } catch (err) {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { username, password });
      
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.friendlyMessage || 'Login failed. Please check your credentials.');
      throw new Error(err.friendlyMessage || 'Login failed. Please check your credentials.');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Call logout API to invalidate the refresh token
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please try again.');
      throw new Error(err.friendlyMessage || 'Registration failed. Please try again.');
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await api.post('/auth/forgot-password', { email });
      return true;
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to process password reset request.');
      throw new Error(err.friendlyMessage || 'Failed to process password reset request.');
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      await api.post('/auth/reset-password', { token, password: newPassword });
      return true;
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to reset password. Please try again.');
      throw new Error(err.friendlyMessage || 'Failed to reset password. Please try again.');
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
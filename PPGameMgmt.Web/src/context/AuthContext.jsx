import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if there is a stored token on initial load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid with the server
          await api.get('/auth/validate-token');
          setCurrentUser(JSON.parse(storedUser));
        } catch (err) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
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
      
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
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
      // Call logout API if your backend requires it
      await api.post('/auth/logout');
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
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
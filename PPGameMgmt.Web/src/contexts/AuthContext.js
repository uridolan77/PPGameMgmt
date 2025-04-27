import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Set the authorization header for API calls
          api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we're simulating a successful login
      // with mock data instead of calling the actual API
      
      // const response = await api.post("/auth/login", credentials);
      // const userData = response.data;
      
      // Mock successful login
      const userData = {
        id: "user123",
        username: credentials.username,
        role: "admin",
        token: "mock-jwt-token",
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      setUser(userData);

      // Redirect to the page user was trying to access or default to dashboard
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Authentication failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
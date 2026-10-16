// ============================================================================
// File: client/src/context/AuthContext.jsx
// 1. What this file does:
//    Keeps track of whether the user is logged in, who they are, and provides
//    login, register, and logout functions to the rest of the React app.
// 2. Why this file exists:
//    Using React Context avoids passing user data down through props manually
//    to every single button or page ("prop drilling").
// 3. Important points to remember:
//    - useAuth(): A custom React hook so any component can say `const { user, logout } = useAuth()`.
//    - Automatically checks on page refresh if the user still has an active login cookie.
// 4. How it connects to other parts:
//    - Wraps all components in 'App.jsx'.
//    - Talks to the backend using 'services/authService.js'.
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has an existing valid session on startup
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      if (res && res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 simply means no active session; reset user to null safely
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await loginUser(credentials);
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const data = await registerUser(userData);
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: Boolean(user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

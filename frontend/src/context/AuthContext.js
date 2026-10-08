'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/apiClient';
import { authStorage } from '../lib/auth';
import { ROUTES, getDefaultDashboardRoute } from '../utils/routes';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current authenticated user profile from GET /api/auth/me.
   */
  const refreshUser = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await apiClient.get('/auth/me');
      if (response?.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        throw new Error('Malformed user profile response');
      }
    } catch {
      // Token is invalid or expired
      authStorage.removeToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize authentication on application load.
   */
  useEffect(() => {
    refreshUser();

    // Listen for 401 unauthorized events dispatched by apiClient
    const handleUnauthorized = () => {
      authStorage.removeToken();
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sbp:unauthorized', handleUnauthorized);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sbp:unauthorized', handleUnauthorized);
      }
    };
  }, [refreshUser]);

  /**
   * Authenticate user with credentials.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Authenticated user object
   */
  const login = async ({ email, password }) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user: userData, token } = response.data;

    if (token) {
      authStorage.setToken(token);
    }
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user account.
   * @param {Object} payload - { name, email, password, role }
   * @returns {Promise<Object>} - Registered user object
   */
  const register = async ({ name, email, password, role }) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    const { user: userData, token } = response.data;

    if (token) {
      authStorage.setToken(token);
    }
    setUser(userData);
    return userData;
  };

  /**
   * Log out user, remove token, clear state, and redirect to login.
   */
  const logout = () => {
    authStorage.removeToken();
    setUser(null);
    router.push(ROUTES.LOGIN);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

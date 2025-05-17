import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  factory: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { 
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await apiRequest('POST', '/api/login', { username, password });
      const data = await result.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/logout', {});
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Skip redirection for login page and when we're still loading
    if (currentPath === '/login' || isLoading) return;
    
    // If we have finished loading and there's no user or there's an error, redirect to login
    if ((!isLoading && !user) || error) {
      navigate('/login');
    }
  }, [user, isLoading, error, navigate]);

  const value = {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
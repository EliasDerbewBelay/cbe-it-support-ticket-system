'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, UserRole } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { getToken, setToken, removeToken } from '@/lib/api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  isEmployee: boolean;
  isTechnician: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch (err) {
      console.warn('Session expired or profile failed to fetch:', err);
      removeToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        setTokenState(storedToken);
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch {
          removeToken();
          setTokenState(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);

      // Redirect based on role
      if (res.user.role === 'ADMINISTRATOR') {
        router.push('/admin/reports');
      } else if (res.user.role === 'TECHNICIAN') {
        router.push('/technician/queue');
      } else {
        router.push('/tickets');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      removeToken();
      setTokenState(null);
      setUser(null);
      router.push('/login');
    }
  };

  const role = user?.role || null;
  const isEmployee = role === 'EMPLOYEE';
  const isTechnician = role === 'TECHNICIAN';
  const isAdmin = role === 'ADMINISTRATOR';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        role,
        isEmployee,
        isTechnician,
        isAdmin,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

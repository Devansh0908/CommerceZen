
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  email: string;
  // Add other user properties here if needed
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<boolean>; // pass is unused in mock
  signup: (email: string, pass: string) => Promise<boolean>; // pass is unused in mock
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'commercezen_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password?: string): Promise<boolean> => {
    // Mock login: In a real app, verify credentials against a backend.
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser = { email };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    toast({ title: "Logged In", description: `Welcome back, ${email}!` });
    setIsLoading(false);
    return true;
  }, [toast]);

  const signup = useCallback(async (email: string, _password?: string): Promise<boolean> => {
    // Mock signup: In a real app, create user in backend.
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const mockUser = { email };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    toast({ title: "Signed Up", description: `Welcome, ${email}! You are now logged in.` });
    setIsLoading(false);
    return true;
  }, [toast]);

  const logout = useCallback(() => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    setIsLoading(false);
  }, [toast]);

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

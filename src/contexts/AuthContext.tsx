
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  email: string;
  name: string; // Name is now mandatory and will be provided at signup
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>; // Added name parameter
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
        const parsedUser = JSON.parse(storedUser);
        // Ensure name exists, provide fallback if migrating from old structure
        if (!parsedUser.name && parsedUser.email) {
            parsedUser.name = parsedUser.email.split('@')[0];
            parsedUser.name = parsedUser.name.charAt(0).toUpperCase() + parsedUser.name.slice(1);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsedUser)); // Update stored user
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // In a real app, you'd fetch user data from a backend.
    // For this mock, we assume if a user tries to log in, their data (including name)
    // should have been stored during a previous signup via localStorage.
    // If they clear localStorage and try to log in, the storedUser would be null.
    // Let's retrieve from localStorage for this mock.
    const storedUserJSON = localStorage.getItem(AUTH_STORAGE_KEY);
    let nameToDisplay = "User"; // Default
    let userToStore: AuthUser | null = null;

    if (storedUserJSON) {
        const storedUser: AuthUser = JSON.parse(storedUserJSON);
        // We find the user by email. In a real app, password would be checked too.
        if (storedUser.email === email) {
            userToStore = storedUser;
            nameToDisplay = storedUser.name;
        }
    }
    
    if (userToStore) {
        setUser(userToStore);
        toast({ title: "Logged In", description: `Welcome back, ${nameToDisplay}!` });
        setIsLoading(false);
        return true;
    } else {
        // If user not found in localStorage or email doesn't match (mock scenario)
        toast({ title: "Login Failed", description: "User not found or credentials incorrect.", variant: "destructive" });
        setIsLoading(false);
        return false;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, _password?: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const mockUser: AuthUser = { email, name }; // Use the provided name
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    toast({ title: "Signed Up", description: `Welcome, ${name}! You are now logged in.` });
    setIsLoading(false);
    return true;
  }, [toast]);

  const logout = useCallback(() => {
    setIsLoading(true);
    const currentUserName = user?.name || 'User';
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast({ title: "Logged Out", description: `Goodbye, ${currentUserName}! You have been successfully logged out.` });
    setIsLoading(false);
  }, [toast, user]);

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

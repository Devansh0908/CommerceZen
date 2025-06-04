
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  email: string;
  name: string; 
}

// This interface will be used for storing in our "simulated text file" (localStorage)
interface StoredUser extends AuthUser {
  password_DO_NOT_USE_IN_PROD: string; // Storing plain text password for simulation only. Highly insecure.
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'commercezen_auth_user_session'; // Stores the currently logged-in user
const USERS_DB_KEY = 'commercezen_users_db'; // Simulates our "text file" of all registered users

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load current user session on initial load
  useEffect(() => {
    try {
      const storedUserSession = localStorage.getItem(CURRENT_USER_SESSION_KEY);
      if (storedUserSession) {
        const parsedUser = JSON.parse(storedUserSession) as AuthUser;
         // Ensure name exists, provide fallback if migrating (less likely now but good practice)
        if (!parsedUser.name && parsedUser.email) {
            parsedUser.name = parsedUser.email.split('@')[0];
            parsedUser.name = parsedUser.name.charAt(0).toUpperCase() + parsedUser.name.slice(1);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse current user session from localStorage", error);
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
    setIsLoading(false);
  }, []);

  const getStoredUsers = (): StoredUser[] => {
    try {
      const usersDb = localStorage.getItem(USERS_DB_KEY);
      return usersDb ? JSON.parse(usersDb) : [];
    } catch (error) {
      console.error("Failed to parse users_db from localStorage", error);
      return [];
    }
  };

  const saveStoredUsers = (users: StoredUser[]): void => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  };

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const usersDb = getStoredUsers();
    const foundUser = usersDb.find(u => u.email === email && u.password_DO_NOT_USE_IN_PROD === pass);

    if (foundUser) {
      const currentUser: AuthUser = { email: foundUser.email, name: foundUser.name };
      setUser(currentUser);
      localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(currentUser));
      toast({ title: "Logged In", description: `Welcome back, ${currentUser.name}!` });
      setIsLoading(false);
      return true;
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const usersDb = getStoredUsers();
    if (usersDb.find(u => u.email === email)) {
      toast({ title: "Signup Failed", description: "Email already exists. Please try logging in or use a different email.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }

    const newUser: StoredUser = { email, name, password_DO_NOT_USE_IN_PROD: pass };
    const updatedUsersDb = [...usersDb, newUser];
    saveStoredUsers(updatedUsersDb);

    const currentUser: AuthUser = { email: newUser.email, name: newUser.name };
    setUser(currentUser);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(currentUser));
    toast({ title: "Signed Up", description: `Welcome, ${name}! You are now logged in.` });
    setIsLoading(false);
    return true;
  }, [toast]);

  const logout = useCallback(() => {
    setIsLoading(true);
    const currentUserName = user?.name || 'User';
    setUser(null);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY); // Clear only the current session
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

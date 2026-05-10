"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "./api-client";
import { normalizeUserProfile, type UserProfile } from "./user-utils";

export type User = UserProfile;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const profile = await authApi.getProfile();
        setUser(normalizeUserProfile(profile));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const setSession = (nextUser: User) => {
    setUser(normalizeUserProfile(nextUser));
  };

  const refreshUser = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(normalizeUserProfile(profile));
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
        setUser,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, getStoredToken, removeStoredToken, setStoredToken } from "@/lib/api";

interface AuthContextType {
  token: string | null;
  user: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.getProfile();
      // "Welcome <username>! You are successfully authenticated."
      const match = profile.message.match(/Welcome (.*?)!/);
      const username = match ? match[1] : "Studio User";
      setToken(currentToken);
      setUser(username);
    } catch {
      // Token invalid or expired
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = (newToken: string, username: string) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(username);
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

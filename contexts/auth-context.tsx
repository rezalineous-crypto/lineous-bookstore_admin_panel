"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { authApi, type User } from "@/lib/api/auth";
import { clearAuthStorage, setAuthTokens, getAccessToken } from "@/lib/api/axios";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const token = getAccessToken();
  if (!token) {
    clearAuthStorage();
    return null;
  }
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });

    setAuthTokens(response.accessToken, response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be within an AuthProvider");
  }
  return context;
}

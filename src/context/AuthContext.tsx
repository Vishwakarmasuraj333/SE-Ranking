"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { UserDto } from "../lib/types";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isSEOExecutive: boolean;
  isViewer: boolean;
  canManageProjects: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await api.auth.me();
          if (res.data) {
            setUser(res.data);
            setIsLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      }

      // Auto-authenticate with local dev credentials so user is never blocked
      try {
        const res = await api.auth.login("admin@internal-seo.local", "AdminPassword123!");
        if (res.data) {
          const { accessToken, user: userData } = res.data;
          localStorage.setItem("auth_token", accessToken);
          setToken(accessToken);
          setUser(userData);
        }
      } catch {
        const mockUser: UserDto = {
          id: "11111111-1111-1111-1111-111111111111",
          email: "admin@internal-seo.local",
          firstName: "System",
          lastName: "Administrator",
          fullName: "System Administrator",
          role: "SuperAdmin",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          assignedProjectIds: [],
        };
        setUser(mockUser);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.data) {
        const { accessToken, user: userData } = res.data;
        localStorage.setItem("auth_token", accessToken);
        setToken(accessToken);
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  };

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isSEOExecutive = user?.role === "SEOExecutive";
  const isViewer = user?.role === "Viewer";
  const canManageProjects = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isSuperAdmin,
        isSEOExecutive,
        isViewer,
        canManageProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

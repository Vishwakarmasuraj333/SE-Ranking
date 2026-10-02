"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserDto } from "../lib/types";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const u = data.user;
          const userDto: UserDto = {
            id: u.id,
            email: u.email,
            firstName: u.name?.split(" ")[0] || "",
            lastName: u.name?.split(" ").slice(1).join(" ") || "",
            fullName: u.name || u.email,
            role: u.role === "OWNER" || u.role === "ADMIN" ? "SuperAdmin" : "SEOExecutive",
            isActive: u.status === "active",
            lastLoginAt: u.lastLoginAt,
            assignedProjectIds: [],
          };
          setUser(userDto);
          setToken(data.session?.id || "authenticated");
          return;
        }
      }
      setUser(null);
      setToken(null);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.user) {
        const u = data.user;
        const userDto: UserDto = {
          id: u.id,
          email: u.email,
          firstName: u.name?.split(" ")[0] || "",
          lastName: u.name?.split(" ").slice(1).join(" ") || "",
          fullName: u.name || u.email,
          role: u.role === "OWNER" || u.role === "ADMIN" ? "SuperAdmin" : "SEOExecutive",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          assignedProjectIds: [],
        };
        setUser(userDto);
        setToken(data.token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("seranking_auth_status");
      sessionStorage.removeItem("seranking_auth_status");
      window.location.href = "/login";
    }
  };

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isSEOExecutive = user?.role === "SEOExecutive";
  const isViewer = user?.role === "Viewer";
  const canManageProjects = isSuperAdmin || user?.role !== "Viewer";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
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

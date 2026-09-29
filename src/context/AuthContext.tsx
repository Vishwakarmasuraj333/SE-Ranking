"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const defaultUser: CurrentUser = {
  id: "usr_admin_1",
  email: "admin@internal-seo.local",
  fullName: "System Administrator",
  role: "SuperAdmin",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setUser: () => {},
  isAuthenticated: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(defaultUser);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("auth_user");
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

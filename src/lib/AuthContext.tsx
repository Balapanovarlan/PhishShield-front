"use client";

import React, { createContext, useContext, useState } from "react";
import { User, AuthState } from "../types";
import { useRouter } from "next/navigation";

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, token: null };
  }
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    return { isAuthenticated: true, user: JSON.parse(user), token };
  }
  return { isAuthenticated: false, user: null, token: null };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  const router = useRouter();

  const login = (user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthState({ isAuthenticated: true, user, token });
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ isAuthenticated: false, user: null, token: null });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

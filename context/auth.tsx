"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
  getAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>("");

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    setToken("");
  };

  const refreshPromise = useRef<Promise<string | null> | null>(null);
  const refresh = async (): Promise<string | null> => {
    if (refreshPromise.current) return refreshPromise.current;

    refreshPromise.current = (async () => {
      try {
        const res = await fetch("/api/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          await logout();
          return null;
        }

        const authData = await res.json();
        const accessToken = authData.accessToken;
        setToken(accessToken);
        return accessToken;
      } catch (err) {
        await logout();
        throw new Error("Session Expired");
      } finally {
        refreshPromise.current = null;
      }
    })();
    return refreshPromise.current;
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (token) {
      const data = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = data.exp * 1000 - Date.now();
      if (expiryTime > 30_000) return token;
    }

    return refresh();
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, getAccessToken, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

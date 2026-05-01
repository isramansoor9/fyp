"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  name?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "teachus_user";
const AUTH_SYNC_EVENT = "teachus:auth-sync";

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    setUserState(readStoredUser());
  }, []);

  useEffect(() => {
    syncFromStorage();
    setIsLoading(false);
  }, [syncFromStorage]);

  const setUser = useCallback((u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUserState(u);
    window.dispatchEvent(new Event(AUTH_SYNC_EVENT));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserState(null);
    window.dispatchEvent(new Event(AUTH_SYNC_EVENT));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFromStorage();
    };
    const onAuthSync = () => syncFromStorage();
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };
    const onFocus = () => syncFromStorage();
    const onPageShow = () => syncFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_SYNC_EVENT, onAuthSync);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_SYNC_EVENT, onAuthSync);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [syncFromStorage]);

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    setUser,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

/** Display name for navbar (supports both login API shape and register/dashboard shape) */
export function getDisplayName(user: AuthUser): string {
  if (user.name) return user.name;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`.trim();
  if (user.firstName) return user.firstName;
  return user.email || "User";
}

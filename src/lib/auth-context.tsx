"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  configureApiTokens,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "./api";
import type { Session } from "./types";
const KEY = "constdoc.customer.session";

/**
 * A non-HttpOnly presence flag the Next proxy (src/proxy.ts) can read to guard
 * /dashboard and /onboarding — the Bearer tokens live in sessionStorage, which the
 * edge proxy cannot see. The cookie carries NO token, only "a session exists here".
 */
const AUTH_COOKIE = "constdoc.customer.authed";
function setAuthCookie(present: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = present
    ? `${AUTH_COOKIE}=1; path=/; samesite=lax; max-age=86400`
    : `${AUTH_COOKIE}=; path=/; samesite=lax; max-age=0`;
}
type Auth = {
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (email: string, password: string, name: string) => Promise<Session>;
  logout: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const save = (next: Session) => {
    setSession(next);
    sessionStorage.setItem(KEY, JSON.stringify(next));
    setAuthCookie(true);
  };
  const refresh = useCallback(async () => {
    if (!session?.refreshToken) return null;
    try {
      const next = await refreshRequest(session.refreshToken);
      save({ ...session, ...next });
      return next.accessToken;
    } catch {
      setSession(null);
      sessionStorage.removeItem(KEY);
      setAuthCookie(false);
      return null;
    }
  }, [session]);
  useEffect(() => {
    const value = sessionStorage.getItem(KEY);
    if (value) {
      try {
        setSession(JSON.parse(value) as Session);
        setAuthCookie(true);
      } catch {
        sessionStorage.removeItem(KEY);
      }
    }
    setIsLoading(false);
  }, []);
  useEffect(() => {
    configureApiTokens({ getAccessToken: () => session?.accessToken ?? null, refresh });
    return () => configureApiTokens(null);
  }, [refresh, session]);
  const value = useMemo(
    () => ({
      session,
      isLoading,
      login: async (email: string, password: string) => {
        const next = await loginRequest(email, password);
        save(next);
        return next;
      },
      register: async (email: string, password: string, name: string) => {
        const next = await registerRequest(email, password, name);
        save(next);
        return next;
      },
      logout: async () => {
        const refreshToken = session?.refreshToken;
        setSession(null);
        sessionStorage.removeItem(KEY);
        setAuthCookie(false);
        if (refreshToken) {
          try {
            await logoutRequest(refreshToken);
          } catch {
            /* local logout still succeeds when the API is unavailable */
          }
        }
      },
    }),
    [isLoading, session],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

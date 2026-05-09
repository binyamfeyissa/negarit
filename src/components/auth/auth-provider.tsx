"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createHttpClient } from "@/lib/api/http";
import { createApi } from "@/lib/api/endpoints";
import type { LoginResponse, Role } from "@/lib/api/types";
import { API_BASE_URL } from "@/lib/config";

type StoredAuth = {
  accessToken: string | null;
  user: LoginResponse["user"] | null;
};

const STORAGE_KEY = "negarit.auth.v1";

function readStored(): StoredAuth {
  if (typeof window === "undefined") return { accessToken: null, user: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, user: null };
    const parsed = JSON.parse(raw) as StoredAuth;
    return { accessToken: parsed.accessToken ?? null, user: parsed.user ?? null };
  } catch {
    return { accessToken: null, user: null };
  }
}

function writeStored(next: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

type AuthContextValue = {
  api: ReturnType<typeof createApi>;
  accessToken: string | null;
  user: LoginResponse["user"] | null;
  isAuthed: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<LoginResponse["user"]>;
  logout: () => Promise<void>;
  registerApplicant: (body: { fullName: string; email: string; password: string; phone?: string }) => Promise<LoginResponse["user"]>;
  registerRecruiter: (body: {
    companyName: string;
    email: string;
    password: string;
    industry: string;
    licenseFile?: File | null;
  }) => Promise<{ message: string; userId: string }>;
  setAuth: (auth: StoredAuth) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshingRef = useRef<Promise<string | null> | null>(null);

  const setAuth = useCallback((auth: StoredAuth) => {
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    writeStored(auth);
  }, []);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return await refreshingRef.current;
    refreshingRef.current = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("refresh failed");
        const json = (await res.json()) as { accessToken?: string };
        if (json?.accessToken) {
          setAuth({ accessToken: json.accessToken, user });
          return json.accessToken;
        }
        setAuth({ accessToken: null, user: null });
        return null;
      } catch {
        setAuth({ accessToken: null, user: null });
        return null;
      } finally {
        refreshingRef.current = null;
      }
    })();
    return await refreshingRef.current;
  }, [setAuth, user]);

  const http = useMemo(
    () =>
      createHttpClient({
        getToken: () => accessToken,
        setToken: (t) => setAuth({ accessToken: t, user }),
        refresh,
      }),
    [accessToken, refresh, setAuth, user],
  );

  const api = useMemo(() => createApi(http), [http]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password });
      setAuth({ accessToken: res.accessToken, user: res.user });
      return res.user;
    },
    [api, setAuth],
  );

  const logout = useCallback(async () => {
    try {
      if (accessToken) await api.auth.logout();
    } finally {
      setAuth({ accessToken: null, user: null });
    }
  }, [accessToken, api, setAuth]);

  const registerApplicant = useCallback(
    async (body: { fullName: string; email: string; password: string; phone?: string }) => {
      const res = await api.auth.registerApplicant({ ...body, role: "applicant" });
      setAuth({ accessToken: res.accessToken, user: res.user });
      return res.user;
    },
    [api, setAuth],
  );

  const registerRecruiter = useCallback(
    async (body: { companyName: string; email: string; password: string; industry: string; licenseFile?: File | null }) => {
      const form = new FormData();
      form.append("companyName", body.companyName);
      form.append("email", body.email);
      form.append("password", body.password);
      form.append("role", "recruiter");
      form.append("industry", body.industry);
      if (body.licenseFile) form.append("file", body.licenseFile);
      return await api.auth.registerRecruiter(form);
    },
    [api],
  );

  // Keep state synced if another tab logs in/out
  useEffect(() => {
    const initial = readStored();
    setAccessToken(initial.accessToken);
    setUser(initial.user);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readStored();
      setAccessToken(next.accessToken);
      setUser(next.user);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      api,
      accessToken,
      user,
      isAuthed: Boolean(accessToken && user),
      isReady,
      login,
      logout,
      registerApplicant,
      registerRecruiter,
      setAuth,
    }),
    [api, accessToken, user, isReady, login, logout, registerApplicant, registerRecruiter, setAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/candidate";
}


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
  verifyEmail: (otp: string) => Promise<LoginResponse["user"]>;
  resendOtp: () => Promise<void>;
  setAuth: (auth: StoredAuth) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // React state — for rendering only
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Refs — authoritative values read by the http client (never stale)
  const tokenRef = useRef<string | null>(null);
  const userRef = useRef<LoginResponse["user"] | null>(null);
  const refreshingRef = useRef<Promise<string | null> | null>(null);

  // Single function to update both refs and state + persist
  function applyAuth(auth: StoredAuth) {
    tokenRef.current = auth.accessToken;
    userRef.current = auth.user;
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    writeStored(auth);
  }

  const setAuth = useCallback((auth: StoredAuth) => {
    applyAuth(auth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // http is created ONCE — it reads from refs so it never goes stale.
  // This prevents the "stale user in closure" logout bug.
  const http = useMemo(
    () =>
      createHttpClient({
        getToken: () => tokenRef.current,

        // Called when a refresh gives us a new access token.
        // Reads userRef (always current) — never captures stale state.
        setToken: (t) => {
          tokenRef.current = t;
          setAccessToken(t);
          writeStored({ accessToken: t, user: userRef.current });
        },

        // Deduped refresh: only one in-flight call at a time.
        refresh: () => {
          if (refreshingRef.current) return refreshingRef.current;
          refreshingRef.current = (async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
              });
              if (!res.ok) {
                // Explicit auth rejection from server — session is gone.
                applyAuth({ accessToken: null, user: null });
                return null;
              }
              const json = (await res.json()) as { accessToken?: string };
              if (json?.accessToken) {
                tokenRef.current = json.accessToken;
                setAccessToken(json.accessToken);
                writeStored({ accessToken: json.accessToken, user: userRef.current });
                return json.accessToken;
              }
              applyAuth({ accessToken: null, user: null });
              return null;
            } catch {
              // Network error: don't clear auth so an offline user isn't logged out.
              // The next successful API call will retry.
              return null;
            } finally {
              refreshingRef.current = null;
            }
          })();
          return refreshingRef.current;
        },
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // api is also stable — created once alongside http
  const api = useMemo(() => createApi(http), [http]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login({ email, password });
      applyAuth({ accessToken: res.accessToken, user: res.user });
      return res.user;
    },
    [api], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) await api.auth.logout();
    } finally {
      applyAuth({ accessToken: null, user: null });
    }
  }, [api]); // eslint-disable-line react-hooks/exhaustive-deps

  const registerApplicant = useCallback(
    async (body: { fullName: string; email: string; password: string; phone?: string }) => {
      const res = await api.auth.registerApplicant({ ...body, role: "applicant" });
      applyAuth({ accessToken: res.accessToken, user: res.user });
      return res.user;
    },
    [api],
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

  const verifyEmail = useCallback(
    async (otp: string) => {
      await api.auth.verifyEmail(otp);
      // The original token still has isVerified: false — refresh to get the updated one.
      const refreshed = await api.auth.refresh();
      // Reconstruct user with isVerified: true from the refreshed token payload.
      // The server encodes this in the JWT; we read it back via /auth/refresh response.
      // Since RefreshResponse only gives us accessToken, keep existing user but flip isVerified.
      const updatedUser = userRef.current ? { ...userRef.current, isVerified: true } : null;
      applyAuth({ accessToken: refreshed.accessToken, user: updatedUser });
      return updatedUser!;
    },
    [api], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const resendOtp = useCallback(async () => {
    await api.auth.resendOtp();
  }, [api]);

  // Hydrate from localStorage on mount — the http client will refresh the
  // access token on the first 401 it encounters (deduped via refreshingRef).
  useEffect(() => {
    applyAuth(readStored());
    setIsReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep state synced when another tab logs in/out
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readStored();
      tokenRef.current = next.accessToken;
      userRef.current = next.user;
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
      verifyEmail,
      resendOtp,
      setAuth,
    }),
    [api, accessToken, user, isReady, login, logout, registerApplicant, registerRecruiter, verifyEmail, resendOtp, setAuth],
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

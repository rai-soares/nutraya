"use client";

import { createContext, useContext, useMemo, useState } from "react";

import {
  clearStoredSession,
  readStoredSession,
  storeSession,
  type AuthSession,
} from "@/modules/auth/auth-storage";
import type { AuthResponse } from "@/modules/shared/types/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  session: AuthSession | null;
  status: AuthStatus;
  setSession: (session: AuthResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() =>
    readStoredSession(),
  );
  const [status, setStatus] = useState<AuthStatus>(() => {
    const stored = readStoredSession();

    return stored ? "authenticated" : "unauthenticated";
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      setSession: (nextSession) => {
        storeSession(nextSession);
        setSessionState(nextSession);
        setStatus("authenticated");
      },
      signOut: () => {
        clearStoredSession();
        setSessionState(null);
        setStatus("unauthenticated");
      },
    }),
    [session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

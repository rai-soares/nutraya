import type { AppUser, AuthResponse, UserRole } from "@/modules/shared/types/api";

export const AUTH_STORAGE_KEY = "nutraya.auth";
export const AUTH_ROLE_COOKIE_KEY = "nutraya.role";
export const LOGIN_ROLE_QUERY_KEY = "role";

export type AuthSession = {
  token: string;
  user: AppUser;
};

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.token || !parsed?.user?.id || !parsed?.user?.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthResponse): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${AUTH_ROLE_COOKIE_KEY}=${session.user.role}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearStoredSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_ROLE_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getRoleHomePath(role: UserRole): string {
  return role === "NUTRI" ? "/nutritionist" : "/patient";
}

export function getLoginPath(role?: UserRole): string {
  if (!role) {
    return "/login";
  }

  return `/login?${LOGIN_ROLE_QUERY_KEY}=${role}`;
}

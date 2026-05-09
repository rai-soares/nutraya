// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import {
  AUTH_ROLE_COOKIE_KEY,
  clearStoredSession,
  getRoleHomePath,
  storeSession,
} from "@/modules/auth/auth-storage";

describe("auth storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${AUTH_ROLE_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  it("returns the patient home path", () => {
    expect(getRoleHomePath("PATIENT")).toBe("/patient");
  });

  it("returns the nutritionist home path", () => {
    expect(getRoleHomePath("NUTRI")).toBe("/nutritionist");
  });

  it("stores the role cookie with the session", () => {
    storeSession({
      token: "token",
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@example.com",
        role: "PATIENT",
      },
    });

    expect(document.cookie).toContain(`${AUTH_ROLE_COOKIE_KEY}=PATIENT`);
  });

  it("clears the role cookie on sign out", () => {
    storeSession({
      token: "token",
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@example.com",
        role: "PATIENT",
      },
    });

    clearStoredSession();

    expect(document.cookie).not.toContain(`${AUTH_ROLE_COOKIE_KEY}=PATIENT`);
  });
});

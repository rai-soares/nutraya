import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, redirectMock, roleEntryScreenMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(),
  roleEntryScreenMock: vi.fn(() => "ROLE_ENTRY_SCREEN"),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/modules/auth/components/role-entry-screen", () => ({
  RoleEntryScreen: roleEntryScreenMock,
}));

describe("Home page", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirects authenticated users to their role home", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "PATIENT" }),
    });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const { default: Home } = await import("@/app/page");

    await expect(Home()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/patient");
  });

  it("renders the entry screen for signed-out users", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { default: Home } = await import("@/app/page");
    const result = await Home();

    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      props: {},
      type: roleEntryScreenMock,
    });
  });
});

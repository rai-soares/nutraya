// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useRouterMock, useSearchParamsMock, useAuthMock } = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

import { LoginScreen } from "@/modules/auth/components/login-screen";
import { appTheme } from "@/theme/app-theme";

describe("LoginScreen", () => {
  beforeEach(() => {
    useRouterMock.mockReset();
    useSearchParamsMock.mockReset();
    useAuthMock.mockReset();

    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
    useAuthMock.mockReturnValue({
      setSession: vi.fn(),
    });
  });

  it("hides the public registration link for the patient flow", () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === "role" ? "PATIENT" : null),
    });

    render(
      <ThemeProvider theme={appTheme}>
        <LoginScreen />
      </ThemeProvider>,
    );

    expect(screen.queryByRole("link", { name: /criar conta/i })).not.toBeInTheDocument();
  });

  it("keeps the public registration link for the nutritionist flow", () => {
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === "role" ? "NUTRI" : null),
    });

    render(
      <ThemeProvider theme={appTheme}>
        <LoginScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("link", { name: /criar conta/i })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});

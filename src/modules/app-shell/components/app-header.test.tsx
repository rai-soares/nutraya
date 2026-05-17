// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAuthMock, usePathnameMock, useRouterMock, useQueryMock } =
  vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    usePathnameMock: vi.fn(),
    useRouterMock: vi.fn(),
    useQueryMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

import { AppHeader } from "@/modules/app-shell/components/app-header";
import { appTheme } from "@/theme/app-theme";

describe("AppHeader", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useAuthMock.mockReset();
    usePathnameMock.mockReset();
    useRouterMock.mockReset();
    useQueryMock.mockReset();

    usePathnameMock.mockReturnValue("/patient");
    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
  });

  it("renders the linked nutritionist name only for patient headers", () => {
    useAuthMock.mockReturnValue({
      session: {
        token: "token",
        user: {
          id: "patient-1",
          name: "Ana Costa",
          email: "ana@example.com",
          role: "PATIENT",
        },
      },
      signOut: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: {
        nutritionist: {
          id: "nutri-1",
          name: "Dra. Paula",
        },
      },
    });

    render(
      <ThemeProvider theme={appTheme}>
        <AppHeader role="PATIENT" title="Início do paciente" />
      </ThemeProvider>,
    );

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Nutricionista: Dra. Paula")).toBeInTheDocument();
  });

  it("does not render the nutritionist line for nutritionist headers", () => {
    useAuthMock.mockReturnValue({
      session: {
        token: "token",
        user: {
          id: "nutri-1",
          name: "Carlos Silva",
          email: "carlos@example.com",
          role: "NUTRI",
        },
      },
      signOut: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: {
        nutritionist: {
          id: "nutri-1",
          name: "Dra. Paula",
        },
      },
    });

    render(
      <ThemeProvider theme={appTheme}>
        <AppHeader role="NUTRI" title="Pacientes" />
      </ThemeProvider>,
    );

    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.queryByText(/Nutricionista:/i)).not.toBeInTheDocument();
  });

  it("keeps the patient header stable while the nutritionist summary is unavailable", () => {
    useAuthMock.mockReturnValue({
      session: {
        token: "token",
        user: {
          id: "patient-1",
          name: "Ana Costa",
          email: "ana@example.com",
          role: "PATIENT",
        },
      },
      signOut: vi.fn(),
    });
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <ThemeProvider theme={appTheme}>
        <AppHeader role="PATIENT" title="Início do paciente" />
      </ThemeProvider>,
    );

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Paciente")).toBeInTheDocument();
    expect(screen.queryByText(/Nutricionista:/i)).not.toBeInTheDocument();
  });
});

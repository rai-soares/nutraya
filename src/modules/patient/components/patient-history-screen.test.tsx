// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAuthMock, usePathnameMock, useQueryMock, useRouterMock, useSearchParamsMock } =
  vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    usePathnameMock: vi.fn(),
    useQueryMock: vi.fn(),
    useRouterMock: vi.fn(),
    useSearchParamsMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => <div />,
  Line: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

import { PatientHistoryScreen } from "@/modules/patient/components/patient-history-screen";
import { appTheme } from "@/theme/app-theme";

function createSearchParams(range?: string | null) {
  const params = new URLSearchParams();

  if (range) {
    params.set("range", range);
  }

  return {
    get: (key: string) => (key === "range" ? range ?? null : null),
    toString: () => params.toString(),
  };
}

function createHistory() {
  return {
    range: 7 as const,
    summary: {
      averageAdherence: 82,
      daysTracked: 6,
      completedMeals: 24,
      totalMeals: 30,
    },
    history: [
      {
        date: "2026-05-12",
        calories: { consumed: 1820, goal: 2000 },
        protein: { consumed: 145, goal: 160 },
        carbs: { consumed: 180, goal: 220 },
        fat: { consumed: 55, goal: 70 },
        completedMeals: 4,
        totalMeals: 5,
        adherencePercentage: 84,
      },
      {
        date: "2026-05-13",
        calories: { consumed: 1900, goal: 2000 },
        protein: { consumed: 150, goal: 160 },
        carbs: { consumed: 200, goal: 220 },
        fat: { consumed: 60, goal: 70 },
        completedMeals: 4,
        totalMeals: 5,
        adherencePercentage: 88,
      },
    ],
  };
}

describe("PatientHistoryScreen", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    usePathnameMock.mockReset();
    useQueryMock.mockReset();
    useRouterMock.mockReset();
    useSearchParamsMock.mockReset();

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
    });

    usePathnameMock.mockReturnValue("/patient/history");
    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  function renderScreen() {
    return render(
      <ThemeProvider theme={appTheme}>
        <PatientHistoryScreen />
      </ThemeProvider>,
    );
  }

  it("shows a loading state while the history is being fetched", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("7"));
    useQueryMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: vi.fn(),
    });

    renderScreen();

    expect(screen.getByText(/carregando histórico/i)).toBeInTheDocument();
  });

  it("shows an error state when the request fails", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("7"));
    useQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("boom"),
      isError: true,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderScreen();

    expect(screen.getByText(/não foi possível carregar seu histórico/i)).toBeInTheDocument();
    expect(screen.getByText(/tente novamente em alguns instantes/i)).toBeInTheDocument();
  });

  it("shows an empty state when there is no tracked history", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("30"));
    useQueryMock.mockReturnValue({
      data: {
        range: 30,
        summary: {
          averageAdherence: 0,
          daysTracked: 0,
          completedMeals: 0,
          totalMeals: 0,
        },
        history: [],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderScreen();

    expect(screen.getByText(/nenhum histórico disponível/i)).toBeInTheDocument();
    expect(
      screen.getByText(/comece registrando suas refeições para acompanhar sua evolução/i),
    ).toBeInTheDocument();
  });

  it("renders summary cards, charts and the daily list on success", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams());
    useQueryMock.mockReturnValue({
      data: createHistory(),
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderScreen();

    expect(router.replace).toHaveBeenCalledWith("/patient/history?range=7");
    expect(screen.getByText("Seu progresso")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("24/30")).toBeInTheDocument();
    expect(screen.getAllByTestId("chart-container")).toHaveLength(2);
    expect(screen.getByText(/12/i)).toBeInTheDocument();
    expect(screen.getByText(/84% de aderência/i)).toBeInTheDocument();
  });

  it("updates the URL when the patient selects a different range", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams("7"));
    useQueryMock.mockReturnValue({
      data: createHistory(),
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    renderScreen();

    fireEvent.click(screen.getByRole("tab", { name: "30 dias" }));

    expect(router.replace).toHaveBeenCalledWith("/patient/history?range=30");
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const {
  useAuthMock,
  useMutationMock,
  usePathnameMock,
  useQueryClientMock,
  useQueryMock,
  useRouterMock,
  useSearchParamsMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useMutationMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  useQueryMock: vi.fn(),
  useRouterMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

import { ApiClientError } from "@/modules/shared/api/api-client";
import { PatientHomeScreen } from "@/modules/patient/components/patient-home-screen";
import { appTheme } from "@/theme/app-theme";

function createSearchParams(date?: string | null) {
  const params = new URLSearchParams();

  if (date) {
    params.set("date", date);
  }

  return {
    get: (key: string) => (key === "date" ? date ?? null : null),
    toString: () => params.toString(),
  };
}

function createProgress(date: string) {
  return {
    date,
    goals: { calories: 2000, protein: 130, carbs: 220, fat: 60 },
    consumed: { calories: 1200, protein: 80, carbs: 120, fat: 30 },
    remaining: { calories: 800, protein: 50, carbs: 100, fat: 30 },
    progress: { calories: 60, protein: 62, carbs: 55, fat: 50 },
    mealPlan: { id: "plan-1", title: "Default plan" },
    meals: [
      {
        id: "meal-1",
        name: "Lunch",
        description: null,
        scheduledTime: "12:00",
        order: 1,
        calories: 600,
        protein: 40,
        carbs: 60,
        fat: 20,
        completed: false,
      },
    ],
    completedMealIds: [],
  };
}

function createSubstitutions() {
  return [
    {
      id: "sub-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      mealId: "meal-1",
      imageUrl: "https://cdn.example.com/meal.jpg",
      note: "Can I swap this?",
      status: "PENDING" as const,
      nutritionistFeedback: "Looks good.",
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      estimatedFoods: ["rice", "chicken"],
      portionEstimate: "One medium plate",
      confidence: "MEDIUM" as const,
      aiNotes: "Estimate available.",
      estimatedAt: "2026-05-17T12:30:00.000Z",
      reviewedAt: "2026-05-17T12:40:00.000Z",
      appliedToDailyLog: true,
      appliedAt: "2026-05-17T13:00:00.000Z",
      appliedByUserId: "nutri-1",
      appliedDailyLogId: "log-1",
      applicationDate: "2026-05-17",
      createdAt: "2026-05-17T12:00:00.000Z",
      updatedAt: "2026-05-17T13:00:00.000Z",
      patient: {
        id: "patient-1",
        name: "Ana Costa",
      },
      nutritionist: {
        id: "nutri-1",
        name: "Nutri One",
      },
      meal: {
        id: "meal-1",
        name: "Lunch",
        mealPlanId: "plan-1",
      },
    },
    {
      id: "sub-2",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      mealId: "meal-1",
      imageUrl: "https://cdn.example.com/meal-old.jpg",
      note: "Old request",
      status: "APPROVED" as const,
      nutritionistFeedback: "Approved.",
      estimatedCalories: 500,
      estimatedProtein: 30,
      estimatedCarbs: 55,
      estimatedFat: 15,
      estimatedFoods: ["rice"],
      portionEstimate: "Small plate",
      confidence: "HIGH" as const,
      aiNotes: "Old estimate.",
      estimatedAt: "2026-05-10T12:30:00.000Z",
      reviewedAt: "2026-05-10T12:40:00.000Z",
      appliedToDailyLog: true,
      appliedAt: "2026-05-10T13:00:00.000Z",
      appliedByUserId: "nutri-1",
      appliedDailyLogId: "log-2",
      applicationDate: "2026-05-10",
      createdAt: "2026-05-10T12:00:00.000Z",
      updatedAt: "2026-05-10T13:00:00.000Z",
      patient: {
        id: "patient-1",
        name: "Ana Costa",
      },
      nutritionist: {
        id: "nutri-1",
        name: "Nutri One",
      },
      meal: {
        id: "meal-1",
        name: "Lunch",
        mealPlanId: "plan-1",
      },
    },
  ];
}

describe("PatientHomeScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T12:00:00.000Z"));

    useAuthMock.mockReset();
    useMutationMock.mockReset();
    usePathnameMock.mockReset();
    useQueryMock.mockReset();
    useQueryClientMock.mockReset();
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

    usePathnameMock.mockReturnValue("/patient");
    useRouterMock.mockReturnValue({
      replace: vi.fn(),
    });
    useQueryClientMock.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function mockDefaultMutations() {
    const mealMutate = vi.fn();
    const uploadMutateAsync = vi.fn();
    const substitutionMutateAsync = vi.fn();
    let callCount = 0;

    useMutationMock.mockImplementation(() => {
      const callIndex = callCount % 3;
      callCount += 1;

      if (callIndex === 0) {
        return {
          isError: false,
          isPending: false,
          mutate: mealMutate,
          mutateAsync: vi.fn(),
          variables: null,
        };
      }

      if (callIndex === 1) {
        return {
          isError: false,
          isPending: false,
          mutateAsync: uploadMutateAsync,
        };
      }

      return {
        isError: false,
        isPending: false,
        isSuccess: false,
        mutateAsync: substitutionMutateAsync,
      };
    });

    return { mealMutate };
  }

  function mockSuccessfulQueries(progressDate: string) {
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "patient-progress") {
        return {
          data: createProgress(progressDate),
          error: null,
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        };
      }

      if (queryKey[0] === "patient-meal-substitutions") {
        return {
          data: createSubstitutions(),
          error: null,
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        };
      }

      return {
        data: undefined,
        error: null,
        isError: false,
        isLoading: false,
        refetch: vi.fn(),
      };
    });
  }

  function renderScreen() {
    return render(
      <ThemeProvider theme={appTheme}>
        <PatientHomeScreen />
      </ThemeProvider>,
    );
  }

  it("uses today by default and persists it in the route query", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams());
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-17");

    renderScreen();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["patient-progress", "patient-1", "2026-05-17"],
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/patient?date=2026-05-17");
    expect(screen.getByLabelText(/selecionar data/i)).toHaveValue("2026-05-17");
  });

  it("reads the selected date from the URL without normalizing valid past dates", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-10"));
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-10");

    renderScreen();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["patient-progress", "patient-1", "2026-05-10"],
      }),
    );
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/selecionar data/i)).toHaveValue("2026-05-10");
  });

  it("falls back to today when the URL contains a future date", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-20"));
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-17");

    renderScreen();

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["patient-progress", "patient-1", "2026-05-17"],
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/patient?date=2026-05-17");
  });

  it("shows past dates as read-only", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-10"));
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-10");

    renderScreen();

    expect(screen.getByText(/esse histórico é somente leitura/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /concluir refeição/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /solicitar substituição/i })).toBeDisabled();
  });

  it("keeps the current day editable and updates the query when the patient selects another past day", () => {
    const router = { replace: vi.fn() };

    useRouterMock.mockReturnValue(router);
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-17"));
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-17");

    renderScreen();

    expect(screen.getByRole("button", { name: /concluir refeição/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /solicitar substituição/i })).toBeEnabled();

    fireEvent.change(screen.getByLabelText(/selecionar data/i), {
      target: { value: "2026-05-15" },
    });

    expect(router.replace).toHaveBeenCalledWith("/patient?date=2026-05-15");
  });

  it("shows only substitutions related to the selected date", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-10"));
    mockDefaultMutations();
    mockSuccessfulQueries("2026-05-10");

    renderScreen();

    fireEvent.click(screen.getByRole("button", { name: /ver solicitação/i }));

    expect(screen.getByText(/old request/i)).toBeInTheDocument();
    expect(screen.queryByText(/can i swap this\?/i)).not.toBeInTheDocument();
  });

  it("shows a setup message when login succeeded but macro goals are missing", () => {
    useSearchParamsMock.mockReturnValue(createSearchParams("2026-05-17"));
    mockDefaultMutations();
    useQueryMock
      .mockReturnValueOnce({
        data: undefined,
        error: new ApiClientError(404, { message: "Macro goal not found." }),
        isError: true,
        isLoading: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: [],
        error: null,
        isError: false,
        isLoading: false,
        refetch: vi.fn(),
      });

    renderScreen();

    expect(
      screen.getByText(
        /seu acesso foi realizado com sucesso\. falta apenas concluir sua configuração nutricional\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/seu nutricionista ainda precisa definir suas metas de macros/i),
    ).toBeInTheDocument();
  });
});

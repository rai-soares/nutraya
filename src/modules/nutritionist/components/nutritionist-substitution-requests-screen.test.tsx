// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it, vi } from "vitest";

const { useAuthMock, useMutationMock, useQueryMock, useQueryClientMock } =
  vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    useMutationMock: vi.fn(),
    useQueryMock: vi.fn(),
    useQueryClientMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

import { NutritionistSubstitutionRequestsScreen } from "@/modules/nutritionist/components/nutritionist-substitution-requests-screen";
import { appTheme } from "@/theme/app-theme";

function buildSubstitution(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    mealId: "meal-1",
    imageUrl: "https://cdn.example.com/meal.jpg",
    note: "Can I swap this?",
    status: "APPROVED",
    nutritionistFeedback: "Looks good.",
    estimatedCalories: 620,
    estimatedProtein: 42,
    estimatedCarbs: 68,
    estimatedFat: 18,
    estimatedFoods: ["rice", "chicken"],
    portionEstimate: "One medium plate",
    confidence: "MEDIUM",
    aiNotes: "Estimate available.",
    estimatedAt: "2026-05-09T12:30:00.000Z",
    reviewedAt: "2026-05-09T12:40:00.000Z",
    appliedToDailyLog: false,
    appliedAt: null,
    appliedByUserId: null,
    appliedDailyLogId: null,
    applicationDate: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:40:00.000Z",
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
    ...overrides,
  };
}

describe("NutritionistSubstitutionRequestsScreen", () => {
  it("shows feedback actions and applied state instead of approval controls", () => {
    useAuthMock.mockReturnValue({
      session: {
        token: "token",
        user: {
          id: "nutri-1",
          name: "Nutri One",
          email: "nutri@example.com",
          role: "NUTRI",
        },
      },
    });
    useQueryClientMock.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
    useMutationMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: vi.fn(),
    });
    useQueryMock
      .mockReturnValueOnce({
        data: [
          {
            patient: {
              id: "patient-1",
              name: "Ana Costa",
            },
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: [
          buildSubstitution(),
          buildSubstitution({
            id: "sub-2",
            appliedToDailyLog: true,
            appliedAt: "2026-05-09T13:00:00.000Z",
            appliedByUserId: "nutri-1",
            appliedDailyLogId: "log-1",
            applicationDate: "2026-05-09",
          }),
          buildSubstitution({
            id: "sub-3",
            estimatedCalories: null,
            estimatedProtein: null,
            estimatedCarbs: null,
            estimatedFat: null,
            confidence: null,
            aiNotes: null,
            estimatedAt: null,
          }),
        ],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      });

    render(
      <ThemeProvider theme={appTheme}>
        <NutritionistSubstitutionRequestsScreen />
      </ThemeProvider>,
    );

    expect(
      screen.getAllByRole("button", { name: /editar feedback|adicionar feedback/i }),
    ).toHaveLength(3);
    expect(
      screen.getByText(/aplicada ao progresso em sábado, 9 de maio/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reject/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply to patient progress/i }),
    ).not.toBeInTheDocument();
  });
});

// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { ApiClientError } from "@/modules/shared/api/api-client";
import { PatientHomeScreen } from "@/modules/patient/components/patient-home-screen";
import { appTheme } from "@/theme/app-theme";

describe("PatientHomeScreen", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useMutationMock.mockReset();
    useQueryMock.mockReset();
    useQueryClientMock.mockReset();
  });

  it("shows a setup message when login succeeded but macro goals are missing", () => {
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
    useQueryClientMock.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
    useMutationMock
      .mockReturnValueOnce({
        isError: false,
        isPending: false,
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        variables: null,
      })
      .mockReturnValueOnce({
        isError: false,
        isPending: false,
        mutateAsync: vi.fn(),
      })
      .mockReturnValueOnce({
        isError: false,
        isPending: false,
        isSuccess: false,
        mutateAsync: vi.fn(),
      });
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

    render(
      <ThemeProvider theme={appTheme}>
        <PatientHomeScreen />
      </ThemeProvider>,
    );

    expect(
      screen.getByText(
        /signed in successfully\. the remaining step is finishing your nutrition setup\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your nutritionist still needs to set your macro goals/i),
    ).toBeInTheDocument();
  });

  it("shows patient-visible substitution state details when a request is selected", () => {
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
    useQueryClientMock.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
    useMutationMock.mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      variables: null,
    });
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: unknown[] }) => {
      if (queryKey[0] === "patient-progress") {
        return {
          data: {
            date: "2026-05-09",
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
          },
          error: null,
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        };
      }

      if (queryKey[0] === "patient-meal-substitutions") {
        return {
          data: [
            {
              id: "sub-1",
              patientId: "patient-1",
              nutritionistId: "nutri-1",
              mealId: "meal-1",
              imageUrl: "https://cdn.example.com/meal.jpg",
              note: "Can I swap this?",
              status: "PENDING",
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
              appliedToDailyLog: true,
              appliedAt: "2026-05-09T13:00:00.000Z",
              appliedByUserId: "nutri-1",
              appliedDailyLogId: "log-1",
              applicationDate: "2026-05-09",
              createdAt: "2026-05-09T12:00:00.000Z",
              updatedAt: "2026-05-09T13:00:00.000Z",
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
          ],
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

    render(
      <ThemeProvider theme={appTheme}>
        <PatientHomeScreen />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /view substitution/i }));

    expect(
      screen.getByText(/applied to patient progress on saturday, may 9/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply to patient progress/i }),
    ).not.toBeInTheDocument();
  });
});

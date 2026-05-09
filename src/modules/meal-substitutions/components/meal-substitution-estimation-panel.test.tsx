// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";

import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
import { appTheme } from "@/theme/app-theme";

function buildSubstitution(overrides: Partial<Parameters<typeof MealSubstitutionEstimationPanel>[0]["substitution"]> = {}) {
  return {
    id: "sub-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    mealId: "meal-1",
    imageUrl: "https://cdn.example.com/meal.jpg",
    note: "Can I swap this?",
    status: "PENDING" as const,
    nutritionistFeedback: null,
    estimatedCalories: null,
    estimatedProtein: null,
    estimatedCarbs: null,
    estimatedFat: null,
    estimatedFoods: null,
    portionEstimate: null,
    confidence: null,
    aiNotes: null,
    estimatedAt: null,
    reviewedAt: null,
    appliedToDailyLog: false,
    appliedAt: null,
    appliedByUserId: null,
    appliedDailyLogId: null,
    applicationDate: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:30:00.000Z",
    patient: {
      id: "patient-1",
      name: "Pat One",
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

describe("MealSubstitutionEstimationPanel", () => {
  it("renders a fallback message when no estimate is available", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <MealSubstitutionEstimationPanel substitution={buildSubstitution()} />
      </ThemeProvider>,
    );

    expect(
      screen.getByText(/o progresso diário não é atualizado automaticamente/i),
    ).toBeInTheDocument();
  });

  it("renders saved estimate details and disclaimer", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <MealSubstitutionEstimationPanel
          substitution={buildSubstitution({
            estimatedCalories: 620,
            estimatedProtein: 42,
            estimatedCarbs: 68,
            estimatedFat: 18,
            estimatedFoods: ["rice", "grilled chicken", "salad"],
            portionEstimate: "One medium plate",
            confidence: "MEDIUM",
            aiNotes:
              "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
            estimatedAt: "2026-05-09T12:30:00.000Z",
          })}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("620 kcal")).toBeInTheDocument();
    expect(screen.getByText(/rice, grilled chicken, salad/i)).toBeInTheDocument();
    expect(screen.getByText(/confiança média/i)).toBeInTheDocument();
    expect(screen.getByText(/os valores podem variar conforme a porção real/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ainda não aplicado ao progresso do paciente/i),
    ).toBeInTheDocument();
  });

  it("renders the applied state when macros were added to progress", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <MealSubstitutionEstimationPanel
          substitution={buildSubstitution({
            estimatedCalories: 620,
            estimatedProtein: 42,
            estimatedCarbs: 68,
            estimatedFat: 18,
            confidence: "MEDIUM",
            aiNotes: "Estimate available.",
            estimatedAt: "2026-05-09T12:30:00.000Z",
            appliedToDailyLog: true,
            appliedAt: "2026-05-09T13:00:00.000Z",
            appliedByUserId: "nutri-1",
            appliedDailyLogId: "log-1",
            applicationDate: "2026-05-09",
          })}
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByText(/aplicado ao progresso do paciente em sábado, 9 de maio/i),
    ).toBeInTheDocument();
  });
});

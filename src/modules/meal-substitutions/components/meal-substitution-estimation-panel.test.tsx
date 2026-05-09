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
      screen.getByText(/daily progress is not updated automatically/i),
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
    expect(screen.getByText(/confidence medium/i)).toBeInTheDocument();
    expect(screen.getByText(/hidden ingredients may affect accuracy/i)).toBeInTheDocument();
  });
});

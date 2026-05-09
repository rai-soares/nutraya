// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@mui/material";

import { MealChecklistItem } from "@/modules/meals/components/meal-checklist-item";
import { appTheme } from "@/theme/app-theme";

describe("MealChecklistItem", () => {
  it("calls onToggle with the meal id and completion state", () => {
    const onToggle = vi.fn();

    render(
      <ThemeProvider theme={appTheme}>
        <MealChecklistItem
          meal={{
            id: "meal-1",
            name: "Breakfast",
            description: "Eggs and oats",
            scheduledTime: "08:00",
            calories: 450,
            protein: 30,
            carbs: 40,
            fat: 12,
            completed: false,
          }}
          onToggle={onToggle}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Concluir refeição" }));

    expect(onToggle).toHaveBeenCalledWith("meal-1", false);
  });

  it("renders substitution state and handles the substitution actions", () => {
    const onRequestSubstitution = vi.fn();
    const onViewSubstitutionRequest = vi.fn();

    render(
      <ThemeProvider theme={appTheme}>
        <MealChecklistItem
          meal={{
            id: "meal-1",
            name: "Breakfast",
            description: "Eggs and oats",
            scheduledTime: "08:00",
            calories: 450,
            protein: 30,
            carbs: 40,
            fat: 12,
            completed: false,
          }}
          substitutionRequest={{
            id: "sub-1",
            appliedToDailyLog: true,
          }}
          onToggle={vi.fn()}
          onRequestSubstitution={onRequestSubstitution}
          onViewSubstitutionRequest={onViewSubstitutionRequest}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Substituição aplicada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Solicitar substituição" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver solicitação" }));

    expect(onRequestSubstitution).toHaveBeenCalledWith("meal-1");
    expect(onViewSubstitutionRequest).toHaveBeenCalledWith("sub-1");
  });
});

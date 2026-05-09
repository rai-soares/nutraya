// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it, vi } from "vitest";

import { MealList } from "@/modules/nutritionist/components/meal-list";
import { appTheme } from "@/theme/app-theme";

describe("MealList", () => {
  it("calls edit and delete handlers for a meal", () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    const meal = {
      id: "meal-1",
      mealPlanId: "plan-1",
      name: "Breakfast",
      description: "Eggs and oats",
      scheduledTime: "08:00",
      order: 1,
      calories: 450,
      protein: 30,
      carbs: 40,
      fat: 12,
      createdAt: "2026-05-09T10:00:00.000Z",
      updatedAt: "2026-05-09T10:00:00.000Z",
    };

    render(
      <ThemeProvider theme={appTheme}>
        <MealList meals={[meal]} onDelete={onDelete} onEdit={onEdit} />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalledWith(meal);
    expect(onDelete).toHaveBeenCalledWith(meal);
  });
});

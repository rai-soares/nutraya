// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it, vi } from "vitest";

import { MacroGoalForm } from "@/modules/nutritionist/components/macro-goal-form";
import { appTheme } from "@/theme/app-theme";

describe("MacroGoalForm", () => {
  it("submits numeric macro values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ThemeProvider theme={appTheme}>
        <MacroGoalForm isSubmitting={false} onSubmit={onSubmit} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText("Calorias (kcal)"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText("Proteína (g)"), {
      target: { value: "120" },
    });
    fireEvent.change(screen.getByLabelText("Carboidratos (g)"), {
      target: { value: "220" },
    });
    fireEvent.change(screen.getByLabelText("Gorduras (g)"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getByRole("button", { name: /criar metas de macros/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      });
    });
  });
});

// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@mui/material";

import { MacroProgressCard } from "@/modules/macros/components/macro-progress-card";
import { appTheme } from "@/theme/app-theme";

describe("MacroProgressCard", () => {
  it("renders the macro values and progress summary", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <MacroProgressCard
          label="Protein"
          consumed={90}
          goal={120}
          remaining={30}
          progress={75}
          unit="g"
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText("30 g remaining")).toBeInTheDocument();
    expect(screen.getByText("75% complete")).toBeInTheDocument();
  });
});

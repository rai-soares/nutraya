// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";

import { RoleEntryScreen } from "@/modules/auth/components/role-entry-screen";
import { appTheme } from "@/theme/app-theme";

describe("RoleEntryScreen", () => {
  it("renders entry options for patients and nutritionists", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <RoleEntryScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText("Sou paciente")).toBeInTheDocument();
    expect(screen.getByText("Sou nutricionista")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /entrar como paciente/i })).toHaveAttribute(
      "href",
      "/login?role=PATIENT",
    );
    expect(
      screen.getByRole("link", { name: /entrar como nutricionista/i }),
    ).toHaveAttribute("href", "/login?role=NUTRI");
  });
});

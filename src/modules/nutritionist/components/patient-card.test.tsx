// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";

import { PatientCard } from "@/modules/nutritionist/components/patient-card";
import { appTheme } from "@/theme/app-theme";

describe("PatientCard", () => {
  it("renders patient info and detail link", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <PatientCard
          patient={{
            id: "profile-1",
            userId: "patient-1",
            nutritionistId: "nutri-1",
            patient: {
              id: "patient-1",
              name: "Ana Costa",
              email: "ana@example.com",
              role: "PATIENT",
              createdAt: "2026-05-09T10:00:00.000Z",
            },
          }}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Ana Costa")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open patient/i })).toHaveAttribute(
      "href",
      "/nutritionist/patients/patient-1",
    );
  });
});

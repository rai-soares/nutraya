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

import { ApiClientError } from "@/modules/shared/api/api-client";
import { PatientHomeScreen } from "@/modules/patient/components/patient-home-screen";
import { appTheme } from "@/theme/app-theme";

describe("PatientHomeScreen", () => {
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
    useMutationMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: vi.fn(),
      variables: null,
    });
    useQueryMock.mockReturnValue({
      data: undefined,
      error: new ApiClientError(404, { message: "Macro goal not found." }),
      isError: true,
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
});

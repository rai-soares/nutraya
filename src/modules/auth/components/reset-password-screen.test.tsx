// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSearchParamsMock, submitPasswordResetMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
  submitPasswordResetMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/modules/auth/auth.api", () => ({
  submitPasswordReset: submitPasswordResetMock,
}));

import { ResetPasswordScreen } from "@/modules/auth/components/reset-password-screen";
import { appTheme } from "@/theme/app-theme";

describe("ResetPasswordScreen", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReset();
    submitPasswordResetMock.mockReset();
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === "token" ? "raw-token" : null),
    });
  });

  it("validates password confirmation before submitting", async () => {
    render(
      <ThemeProvider theme={appTheme}>
        <ResetPasswordScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Nutraya" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: /redefinir senha/i }));

    expect(await screen.findByText("As senhas não coincidem")).toBeInTheDocument();
    expect(submitPasswordResetMock).not.toHaveBeenCalled();
  });

  it("submits the new password and shows the success state", async () => {
    submitPasswordResetMock.mockResolvedValue({
      message: "Senha redefinida com sucesso.",
    });

    render(
      <ThemeProvider theme={appTheme}>
        <ResetPasswordScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Nutraya" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nova senha"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(submitPasswordResetMock).toHaveBeenCalledWith("raw-token", "123456");
    });

    expect(
      await screen.findByText("Sua senha foi redefinida com sucesso."),
    ).toBeInTheDocument();
  });

  it("shows the invalid link state when the token is missing", () => {
    useSearchParamsMock.mockReturnValue({
      get: () => null,
    });

    render(
      <ThemeProvider theme={appTheme}>
        <ResetPasswordScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Nutraya" })).toBeInTheDocument();
    expect(
      screen.getByText("Link inválido ou expirado. Solicite uma nova redefinição de senha."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redefinir senha/i })).toBeDisabled();
  });
});

// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestPasswordResetMock } = vi.hoisted(() => ({
  requestPasswordResetMock: vi.fn(),
}));

vi.mock("@/modules/auth/auth.api", () => ({
  requestPasswordReset: requestPasswordResetMock,
}));

import { ForgotPasswordScreen } from "@/modules/auth/components/forgot-password-screen";
import { appTheme } from "@/theme/app-theme";

describe("ForgotPasswordScreen", () => {
  beforeEach(() => {
    requestPasswordResetMock.mockReset();
  });

  it("submits the email and shows the generic success message", async () => {
    requestPasswordResetMock.mockResolvedValue({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });

    render(
      <ThemeProvider theme={appTheme}>
        <ForgotPasswordScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Nutraya" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "ana@mail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar instruções/i }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith("ana@mail.com");
    });

    expect(
      await screen.findByText(
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the fallback error when the request fails", async () => {
    requestPasswordResetMock.mockRejectedValue(new Error("boom"));

    render(
      <ThemeProvider theme={appTheme}>
        <ForgotPasswordScreen />
      </ThemeProvider>,
    );

    expect(screen.getByRole("img", { name: "Nutraya" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "ana@mail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar instruções/i }));

    expect(
      await screen.findByText(
        "Não foi possível solicitar a redefinição de senha. Tente novamente.",
      ),
    ).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { resetPasswordMock } = vi.hoisted(() => ({
  resetPasswordMock: vi.fn(),
}));

vi.mock("@/modules/auth/password-reset.service", () => ({
  resetPassword: resetPasswordMock,
}));

import { AppError } from "@/lib/errors";
import { POST } from "@/app/api/auth/reset-password/route";

describe("/api/auth/reset-password route", () => {
  beforeEach(() => {
    resetPasswordMock.mockReset();
  });

  it("returns status 200 on a valid password reset", async () => {
    resetPasswordMock.mockResolvedValue({
      message: "Senha redefinida com sucesso.",
    });

    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "raw-token",
        password: "123456",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Senha redefinida com sucesso.",
    });
  });

  it("returns status 400 for an invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "",
        password: "123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("returns status 400 for an invalid or expired token", async () => {
    resetPasswordMock.mockRejectedValue(
      new AppError(
        "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
        400,
      ),
    );

    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "expired-token",
        password: "123456",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
    });
  });
});

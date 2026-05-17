import { beforeEach, describe, expect, it, vi } from "vitest";

const { forgotPasswordMock } = vi.hoisted(() => ({
  forgotPasswordMock: vi.fn(),
}));

vi.mock("@/modules/auth/password-reset.service", () => ({
  forgotPassword: forgotPasswordMock,
}));

import { POST } from "@/app/api/auth/forgot-password/route";

describe("/api/auth/forgot-password route", () => {
  beforeEach(() => {
    forgotPasswordMock.mockReset();
  });

  it("returns status 200 with the generic message", async () => {
    forgotPasswordMock.mockResolvedValue({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });

    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: "ana@mail.com",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });
  });

  it("returns status 400 for an invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(forgotPasswordMock).not.toHaveBeenCalled();
  });
});

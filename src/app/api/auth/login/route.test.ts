import { beforeEach, describe, expect, it, vi } from "vitest";

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  login: loginMock,
}));

import { AppError } from "@/lib/errors";
import { POST } from "@/app/api/auth/login/route";

describe("/api/auth/login route", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it("returns status 200 with token and user on valid login", async () => {
    loginMock.mockResolvedValue({
      token: "jwt-token",
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        role: "PATIENT",
      },
    });

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "ana@mail.com",
        password: "123456",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.token).toBe("jwt-token");
    expect(body.user).toMatchObject({ id: "user-1", email: "ana@mail.com" });
  });

  it("returns status 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("returns status 401 for wrong credentials", async () => {
    loginMock.mockRejectedValue(
      new AppError("Invalid email or password.", 401),
    );

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "ana@mail.com",
        password: "wrong",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Invalid email or password.",
    });
  });
});

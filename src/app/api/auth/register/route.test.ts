import { beforeEach, describe, expect, it, vi } from "vitest";

const { createUserMock, generateTokenMock } = vi.hoisted(() => ({
  createUserMock: vi.fn(),
  generateTokenMock: vi.fn(),
}));

vi.mock("@/modules/users/user.service", () => ({
  createUser: createUserMock,
}));

vi.mock("@/modules/auth/auth.service", () => ({
  generateToken: generateTokenMock,
}));

import { POST } from "@/app/api/auth/register/route";

describe("/api/auth/register route", () => {
  beforeEach(() => {
    createUserMock.mockReset();
    generateTokenMock.mockReset();
  });

  it("registers a user and returns status 201 with token", async () => {
    createUserMock.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      role: "NUTRI",
      createdAt: "2026-05-03T00:00:00.000Z",
    });
    generateTokenMock.mockResolvedValue("jwt-token");

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ana",
        email: "ana@mail.com",
        password: "123456",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(createUserMock).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456",
      role: "NUTRI",
    });
    const body = await response.json();
    expect(body.token).toBe("jwt-token");
    expect(body.user).toMatchObject({ id: "user-1", email: "ana@mail.com" });
    expect(generateTokenMock).toHaveBeenCalledWith({
      userId: "user-1",
      role: "NUTRI",
    });
  });

  it("returns status 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        email: "invalid",
        password: "123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("returns status 409 when email already exists", async () => {
    const { Prisma } = await import("@prisma/client");
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError> & {
      code: string;
    };
    error.code = "P2002";
    createUserMock.mockRejectedValue(error);

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ana",
        email: "ana@mail.com",
        password: "123456",
        role: "PATIENT",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("ignores a patient role sent by the client and still creates a nutritionist", async () => {
    createUserMock.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      role: "NUTRI",
      createdAt: "2026-05-03T00:00:00.000Z",
    });
    generateTokenMock.mockResolvedValue("jwt-token");

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ana",
        email: "ana@mail.com",
        password: "123456",
        role: "PATIENT",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(createUserMock).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456",
      role: "NUTRI",
    });
  });
});

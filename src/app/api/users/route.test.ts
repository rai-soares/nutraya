import { beforeEach, describe, expect, it, vi } from "vitest";

const { createUserMock, listUsersMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    createUserMock: vi.fn(),
    listUsersMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/modules/users/user.service", () => ({
  createUser: createUserMock,
  listUsers: listUsersMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { AppError } from "@/lib/errors";
import { GET, POST } from "@/app/api/users/route";

describe("/api/users route", () => {
  beforeEach(() => {
    createUserMock.mockReset();
    listUsersMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("creates a user and returns status 201", async () => {
    createUserMock.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      role: "PATIENT",
      createdAt: "2026-05-03T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: "Ana",
        email: "ana@mail.com",
        password: "123456",
        role: "PATIENT",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: "user-1",
      email: "ana@mail.com",
    });
  });

  it("returns status 400 for invalid user payload", async () => {
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        email: "invalid",
        password: "123",
        role: "PATIENT",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("lists users with status 200", async () => {
    listUsersMock.mockResolvedValue([
      {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        role: "NUTRI",
        createdAt: "2026-05-03T00:00:00.000Z",
      },
    ]);

    const response = await GET(new Request("http://localhost/api/users"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toHaveLength(1);
  });

  it("maps service errors into route responses", async () => {
    listUsersMock.mockRejectedValue(new AppError("Conflict.", 409));

    const response = await GET(new Request("http://localhost/api/users"));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ message: "Conflict." });
  });

  it("returns status 401 when not authenticated on POST", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const request = new Request("http://localhost/api/users", {
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

    expect(response.status).toBe(401);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("returns status 403 when non-nutritionist creates a user", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
    requireRoleMock.mockImplementation(() => {
      throw new AppError("Insufficient permissions.", 403);
    });

    const request = new Request("http://localhost/api/users", {
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

    expect(response.status).toBe(403);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("returns status 401 when not authenticated on GET", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const response = await GET(new Request("http://localhost/api/users"));

    expect(response.status).toBe(401);
    expect(listUsersMock).not.toHaveBeenCalled();
  });
});

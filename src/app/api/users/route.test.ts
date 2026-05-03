import { beforeEach, describe, expect, it, vi } from "vitest";

const { createUserMock, listUsersMock } = vi.hoisted(() => ({
  createUserMock: vi.fn(),
  listUsersMock: vi.fn(),
}));

vi.mock("@/modules/users/user.service", () => ({
  createUser: createUserMock,
  listUsers: listUsersMock,
}));

import { AppError } from "@/lib/errors";
import { GET, POST } from "@/app/api/users/route";

describe("/api/users route", () => {
  beforeEach(() => {
    createUserMock.mockReset();
    listUsersMock.mockReset();
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

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toHaveLength(1);
  });

  it("maps service errors into route responses", async () => {
    listUsersMock.mockRejectedValue(new AppError("Conflict.", 409));

    const response = await GET();

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ message: "Conflict." });
  });
});

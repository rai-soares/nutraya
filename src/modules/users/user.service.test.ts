import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { hash } from "bcryptjs";

import { createUser, listUsers } from "@/modules/users/user.service";

describe("user service", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(hash).mockReset();
  });

  it("hashes the password before creating the user", async () => {
    vi.mocked(hash).mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      role: UserRole.PATIENT,
      createdAt: new Date("2026-05-03T00:00:00.000Z"),
    });

    const result = await createUser({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456",
      role: UserRole.PATIENT,
    });

    expect(hash).toHaveBeenCalledWith("123456", 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: "hashed-password",
        }),
      }),
    );
    expect(result.email).toBe("ana@mail.com");
  });

  it("lists users ordered by latest creation date", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        role: UserRole.NUTRI,
        createdAt: new Date("2026-05-03T00:00:00.000Z"),
      },
    ]);

    const result = await listUsers();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    expect(result).toHaveLength(1);
  });
});

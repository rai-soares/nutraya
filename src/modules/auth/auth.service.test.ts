import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

const { comparePasswordMock } = vi.hoisted(() => ({
  comparePasswordMock: vi.fn(),
}));

vi.mock("@/lib/crypto", () => ({
  comparePassword: comparePasswordMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  generateToken,
  login,
  verifyToken,
} from "@/modules/auth/auth.service";

describe("auth service", () => {
  beforeEach(() => {
    resetPrismaMock();
    comparePasswordMock.mockReset();
  });

  describe("login", () => {
    it("returns a token and user for valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        password: "hashed-password",
        role: UserRole.PATIENT,
      });
      comparePasswordMock.mockResolvedValue(true);

      const result = await login({
        email: "ana@mail.com",
        password: "123456",
      });

      expect(comparePasswordMock).toHaveBeenCalledWith(
        "123456",
        "hashed-password",
      );
      expect(result.token).toBeDefined();
      expect(result.user).toMatchObject({
        id: "user-1",
        email: "ana@mail.com",
        role: UserRole.PATIENT,
      });
    });

    it("throws 401 when user is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        login({ email: "unknown@mail.com", password: "123456" }),
      ).rejects.toMatchObject({
        message: "Invalid email or password.",
        statusCode: 401,
      });
    });

    it("throws 401 when password does not match", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        password: "hashed-password",
        role: UserRole.PATIENT,
      });
      comparePasswordMock.mockResolvedValue(false);

      await expect(
        login({ email: "ana@mail.com", password: "wrong" }),
      ).rejects.toMatchObject({
        message: "Invalid email or password.",
        statusCode: 401,
      });
    });
  });

  describe("generateToken / verifyToken", () => {
    it("produces a token that can be verified", async () => {
      const payload = { userId: "user-1", role: UserRole.NUTRI };

      const token = await generateToken(payload);
      const decoded = await verifyToken(token);

      expect(decoded.userId).toBe("user-1");
      expect(decoded.role).toBe(UserRole.NUTRI);
    });

    it("rejects an invalid token", async () => {
      await expect(verifyToken("not-a-valid-token")).rejects.toThrow();
    });
  });
});

import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  verifyToken: verifyTokenMock,
}));

import { requireAuth, requireRole } from "@/lib/auth";

describe("auth guards", () => {
  beforeEach(() => {
    verifyTokenMock.mockReset();
  });

  describe("requireAuth", () => {
    it("returns the payload for a valid Bearer token", async () => {
      verifyTokenMock.mockResolvedValue({
        userId: "user-1",
        role: UserRole.NUTRI,
      });

      const request = new Request("http://localhost", {
        headers: { Authorization: "Bearer valid-token" },
      });

      const result = await requireAuth(request);

      expect(verifyTokenMock).toHaveBeenCalledWith("valid-token");
      expect(result).toEqual({ userId: "user-1", role: UserRole.NUTRI });
    });

    it("throws 401 when no Authorization header is present", async () => {
      const request = new Request("http://localhost");

      await expect(requireAuth(request)).rejects.toMatchObject({
        message: "Authentication required.",
        statusCode: 401,
      });
    });

    it("throws 401 when the header does not start with Bearer", async () => {
      const request = new Request("http://localhost", {
        headers: { Authorization: "Basic abc123" },
      });

      await expect(requireAuth(request)).rejects.toMatchObject({
        message: "Authentication required.",
        statusCode: 401,
      });
    });

    it("throws 401 when the token is invalid", async () => {
      verifyTokenMock.mockRejectedValue(new Error("invalid"));

      const request = new Request("http://localhost", {
        headers: { Authorization: "Bearer bad-token" },
      });

      await expect(requireAuth(request)).rejects.toMatchObject({
        message: "Invalid or expired token.",
        statusCode: 401,
      });
    });
  });

  describe("requireRole", () => {
    it("passes when the user role matches", () => {
      const user = { userId: "user-1", role: UserRole.NUTRI };

      expect(() => requireRole(user, UserRole.NUTRI)).not.toThrow();
    });

    it("passes when the user role is one of multiple allowed roles", () => {
      const user = { userId: "user-1", role: UserRole.PATIENT };

      expect(() =>
        requireRole(user, UserRole.NUTRI, UserRole.PATIENT),
      ).not.toThrow();
    });

    it("throws 403 when the user role does not match", () => {
      const user = { userId: "user-1", role: UserRole.PATIENT };

      expect(() => requireRole(user, UserRole.NUTRI)).toThrow(
        expect.objectContaining({
          message: "Insufficient permissions.",
          statusCode: 403,
        }),
      );
    });
  });
});

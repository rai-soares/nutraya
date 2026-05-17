import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

const { hashPasswordMock, sendPasswordResetEmailMock } = vi.hoisted(() => ({
  hashPasswordMock: vi.fn(),
  sendPasswordResetEmailMock: vi.fn(),
}));

vi.mock("@/lib/crypto", () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/modules/auth/password-reset-email", () => ({
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

import {
  forgotPassword,
  hashPasswordResetToken,
  resetPassword,
} from "@/modules/auth/password-reset.service";
import {
  FORGOT_PASSWORD_MESSAGE,
  RESET_PASSWORD_INVALID_MESSAGE,
  RESET_PASSWORD_SUCCESS_MESSAGE,
} from "@/modules/auth/password-reset.types";

describe("password reset service", () => {
  beforeEach(() => {
    resetPrismaMock();
    hashPasswordMock.mockReset();
    sendPasswordResetEmailMock.mockReset();
    process.env.APP_URL = "http://localhost:3000";
  });

  it("returns the same forgot-password message when the email does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await forgotPassword({ email: "missing@mail.com" });

    expect(result).toEqual({ message: FORGOT_PASSWORD_MESSAGE });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("creates a hashed token and sends the reset email for an existing user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
    });

    const result = await forgotPassword({ email: "ana@mail.com" });

    expect(result).toEqual({ message: FORGOT_PASSWORD_MESSAGE });
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);

    const createArgs = prismaMock.passwordResetToken.create.mock.calls[0][0];
    const emailArgs = sendPasswordResetEmailMock.mock.calls[0][0];
    const rawToken = new URL(emailArgs.resetUrl).searchParams.get("token");

    expect(rawToken).toBeTruthy();
    expect(createArgs.data.userId).toBe("user-1");
    expect(createArgs.data.tokenHash).toBe(hashPasswordResetToken(rawToken!));
    expect(createArgs.data.tokenHash).not.toBe(rawToken);
  });

  it("resets the password, marks the token as used, and invalidates sibling tokens", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "reset-1",
      userId: "user-1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    hashPasswordMock.mockResolvedValue("hashed-password");

    const result = await resetPassword({
      token: "raw-token",
      password: "new-password",
    });

    expect(result).toEqual({ message: RESET_PASSWORD_SUCCESS_MESSAGE });
    expect(hashPasswordMock).toHaveBeenCalledWith("new-password");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "hashed-password" },
    });
    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: "reset-1" },
      data: { usedAt: expect.any(Date) },
    });
    expect(prismaMock.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        usedAt: null,
        id: { not: "reset-1" },
      },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("rejects an invalid token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);

    await expect(
      resetPassword({ token: "invalid-token", password: "new-password" }),
    ).rejects.toMatchObject({
      message: RESET_PASSWORD_INVALID_MESSAGE,
      statusCode: 400,
    });
  });

  it("rejects an expired token", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "reset-1",
      userId: "user-1",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(
      resetPassword({ token: "expired-token", password: "new-password" }),
    ).rejects.toMatchObject({
      message: RESET_PASSWORD_INVALID_MESSAGE,
      statusCode: 400,
    });
  });
});

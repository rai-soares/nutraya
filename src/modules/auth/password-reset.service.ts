import { createHash, randomBytes } from "node:crypto";

import { hashPassword } from "@/lib/crypto";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import { sendPasswordResetEmail } from "./password-reset-email";
import {
  FORGOT_PASSWORD_MESSAGE,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
  RESET_PASSWORD_INVALID_MESSAGE,
  RESET_PASSWORD_SUCCESS_MESSAGE,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./password-reset.types";

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: buildResetPasswordUrl(rawToken),
  });

  return { message: FORGOT_PASSWORD_MESSAGE };
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashPasswordResetToken(input.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw new AppError(RESET_PASSWORD_INVALID_MESSAGE, 400);
  }

  const hashedPassword = await hashPassword(input.password);
  const usedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt },
    });
  });

  return { message: RESET_PASSWORD_SUCCESS_MESSAGE };
}

export function hashPasswordResetToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function generatePasswordResetToken() {
  return randomBytes(32).toString("hex");
}

function buildResetPasswordUrl(rawToken: string) {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  const url = new URL("/reset-password", appUrl);
  url.searchParams.set("token", rawToken);

  return url.toString();
}

import { SignJWT, jwtVerify } from "jose";

import { comparePassword } from "@/lib/crypto";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type { AuthResult, JwtPayload, LoginInput } from "./auth.types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, password: true, role: true },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const valid = await comparePassword(input.password, user.password);

  if (!valid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = await generateToken({ userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function generateToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret);

  return payload as unknown as JwtPayload;
}

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

import type { CreateUserInput, UserDto } from "./user.types";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const password = await hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      role: input.role,
    },
    select: userSelect,
  });
}

export async function listUsers(): Promise<UserDto[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });
}

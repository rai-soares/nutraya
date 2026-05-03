import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.nativeEnum(UserRole),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

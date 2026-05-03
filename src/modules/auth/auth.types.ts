import { UserRole } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

export type AuthResult = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

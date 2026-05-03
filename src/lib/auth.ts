import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { verifyToken } from "@/modules/auth/auth.service";
import type { JwtPayload } from "@/modules/auth/auth.types";

export async function requireAuth(request: Request): Promise<JwtPayload> {
  const header = request.headers.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required.", 401);
  }

  const token = header.slice(7);

  try {
    return await verifyToken(token);
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
}

export function requireRole(user: JwtPayload, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new AppError("Insufficient permissions.", 403);
  }
}

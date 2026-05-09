import { UserRole } from "@prisma/client";

import { handleRouteError, jsonResponse } from "@/lib/http";
import { generateToken } from "@/modules/auth/auth.service";
import { createUser } from "@/modules/users/user.service";
import { createUserSchema } from "@/modules/users/user.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createUserSchema.parse({
      name: body.name,
      email: body.email,
      password: body.password,
      role: UserRole.NUTRI,
    });
    const user = await createUser(input);
    const token = await generateToken({ userId: user.id, role: user.role });

    return jsonResponse({ token, user }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

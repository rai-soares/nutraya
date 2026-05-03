import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { createUser, listUsers } from "@/modules/users/user.service";
import { createUserSchema } from "@/modules/users/user.types";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const body = await request.json();
    const input = createUserSchema.parse(body);
    const created = await createUser(input);

    return jsonResponse(created, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireAuth(request);

    const users = await listUsers();

    return jsonResponse(users);
  } catch (error) {
    return handleRouteError(error);
  }
}

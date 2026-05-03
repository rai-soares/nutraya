import { handleRouteError, jsonResponse } from "@/lib/http";
import { createUser, listUsers } from "@/modules/users/user.service";
import { createUserSchema } from "@/modules/users/user.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createUserSchema.parse(body);
    const user = await createUser(input);

    return jsonResponse(user, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET() {
  try {
    const users = await listUsers();

    return jsonResponse(users);
  } catch (error) {
    return handleRouteError(error);
  }
}

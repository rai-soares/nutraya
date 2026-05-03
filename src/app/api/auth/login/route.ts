import { handleRouteError, jsonResponse } from "@/lib/http";
import { login } from "@/modules/auth/auth.service";
import { loginSchema } from "@/modules/auth/auth.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await login(input);

    return jsonResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

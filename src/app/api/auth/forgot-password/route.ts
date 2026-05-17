import { handleRouteError, jsonResponse } from "@/lib/http";
import { forgotPassword } from "@/modules/auth/password-reset.service";
import { forgotPasswordSchema } from "@/modules/auth/password-reset.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);
    const result = await forgotPassword(input);

    return jsonResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

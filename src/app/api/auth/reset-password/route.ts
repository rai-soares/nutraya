import { handleRouteError, jsonResponse } from "@/lib/http";
import { resetPassword } from "@/modules/auth/password-reset.service";
import { resetPasswordSchema } from "@/modules/auth/password-reset.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = resetPasswordSchema.parse(body);
    const result = await resetPassword(input);

    return jsonResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

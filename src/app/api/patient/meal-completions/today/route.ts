import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getTodayCompletedMeals } from "@/modules/meal-completions/meal-completion.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const completions = await getTodayCompletedMeals(user.userId);

    return jsonResponse(completions);
  } catch (error) {
    return handleRouteError(error);
  }
}

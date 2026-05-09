import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getActiveMealsForPatient } from "@/modules/meal-plans/meal-plan.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const meals = await getActiveMealsForPatient(user.userId);

    return jsonResponse(meals);
  } catch (error) {
    return handleRouteError(error);
  }
}

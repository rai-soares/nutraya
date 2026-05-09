import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getActiveMealPlanForPatient } from "@/modules/meal-plans/meal-plan.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const mealPlan = await getActiveMealPlanForPatient(user.userId);

    return jsonResponse(mealPlan);
  } catch (error) {
    return handleRouteError(error);
  }
}

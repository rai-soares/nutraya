import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { createMealPlan } from "@/modules/meal-plans/meal-plan.service";
import { createMealPlanSchema } from "@/modules/meal-plans/meal-plan.types";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const body = await request.json();
    const input = createMealPlanSchema.parse(body);
    const mealPlan = await createMealPlan(user.userId, input);

    return jsonResponse(mealPlan, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

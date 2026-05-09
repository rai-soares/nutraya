import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { createMeal } from "@/modules/meal-plans/meal-plan.service";
import { createMealSchema } from "@/modules/meal-plans/meal-plan.types";

type RouteContext = {
  params: Promise<{
    mealPlanId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId } = await context.params;
    const body = await request.json();
    const input = createMealSchema.parse(body);
    const meal = await createMeal(user.userId, mealPlanId, input);

    return jsonResponse(meal, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

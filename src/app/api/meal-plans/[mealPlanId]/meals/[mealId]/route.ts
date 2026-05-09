import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { deleteMeal, updateMeal } from "@/modules/meal-plans/meal-plan.service";
import { updateMealSchema } from "@/modules/meal-plans/meal-plan.types";

type RouteContext = {
  params: Promise<{
    mealPlanId: string;
    mealId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId, mealId } = await context.params;
    const body = await request.json();
    const input = updateMealSchema.parse(body);
    const meal = await updateMeal(user.userId, mealPlanId, mealId, input);

    return jsonResponse(meal);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId, mealId } = await context.params;
    await deleteMeal(user.userId, mealPlanId, mealId);

    return jsonResponse({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  deleteMealPlan,
  getMealPlanById,
  updateMealPlan,
} from "@/modules/meal-plans/meal-plan.service";
import { updateMealPlanSchema } from "@/modules/meal-plans/meal-plan.types";

type RouteContext = {
  params: Promise<{
    mealPlanId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId } = await context.params;
    const mealPlan = await getMealPlanById(user.userId, mealPlanId);

    return jsonResponse(mealPlan);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId } = await context.params;
    const body = await request.json();
    const input = updateMealPlanSchema.parse(body);
    const mealPlan = await updateMealPlan(user.userId, mealPlanId, input);

    return jsonResponse(mealPlan);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { mealPlanId } = await context.params;
    await deleteMealPlan(user.userId, mealPlanId);

    return jsonResponse({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

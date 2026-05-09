import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { activateMealPlan } from "@/modules/meal-plans/meal-plan.service";

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
    const mealPlan = await activateMealPlan(user.userId, mealPlanId);

    return jsonResponse(mealPlan);
  } catch (error) {
    return handleRouteError(error);
  }
}

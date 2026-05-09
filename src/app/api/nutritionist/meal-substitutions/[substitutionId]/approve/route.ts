import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { approveMealSubstitution } from "@/modules/meal-substitutions/meal-substitution.service";
import {
  mealSubstitutionIdParamSchema,
  nutritionistReviewMealSubstitutionBodySchema,
} from "@/modules/meal-substitutions/meal-substitution.types";

type RouteContext = {
  params: Promise<{
    substitutionId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const params = await context.params;
    const { substitutionId } = mealSubstitutionIdParamSchema.parse(params);
    const body = await request.json();
    const input = nutritionistReviewMealSubstitutionBodySchema.parse(body);
    const substitution = await approveMealSubstitution(
      user.userId,
      substitutionId,
      input,
    );

    return jsonResponse(substitution, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

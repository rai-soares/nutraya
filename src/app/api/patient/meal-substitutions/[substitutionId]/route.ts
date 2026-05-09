import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getPatientMealSubstitutionById } from "@/modules/meal-substitutions/meal-substitution.service";
import { mealSubstitutionIdParamSchema } from "@/modules/meal-substitutions/meal-substitution.types";

type RouteContext = {
  params: Promise<{
    substitutionId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const params = await context.params;
    const { substitutionId } = mealSubstitutionIdParamSchema.parse(params);
    const substitution = await getPatientMealSubstitutionById(
      user.userId,
      substitutionId,
    );

    return jsonResponse(substitution);
  } catch (error) {
    return handleRouteError(error);
  }
}

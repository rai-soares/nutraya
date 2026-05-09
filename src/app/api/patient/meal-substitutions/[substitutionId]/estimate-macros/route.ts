import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  estimatePatientMealSubstitutionMacros,
} from "@/modules/meal-substitutions/meal-substitution.service";
import {
  mealSubstitutionEstimateMacrosBodySchema,
  mealSubstitutionIdParamSchema,
} from "@/modules/meal-substitutions/meal-substitution.types";

type RouteContext = {
  params: Promise<{
    substitutionId: string;
  }>;
};

async function parseEstimateBody(request: Request) {
  const text = await request.text();

  if (!text.trim()) {
    return mealSubstitutionEstimateMacrosBodySchema.parse({});
  }

  return mealSubstitutionEstimateMacrosBodySchema.parse(JSON.parse(text));
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const params = await context.params;
    const { substitutionId } = mealSubstitutionIdParamSchema.parse(params);
    const input = await parseEstimateBody(request);
    const estimation = await estimatePatientMealSubstitutionMacros(
      user.userId,
      substitutionId,
      input,
    );

    return jsonResponse(estimation);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { listNutritionistMealSubstitutions } from "@/modules/meal-substitutions/meal-substitution.service";
import { nutritionistMealSubstitutionQuerySchema } from "@/modules/meal-substitutions/meal-substitution.types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { searchParams } = new URL(request.url);
    const { patientId } = nutritionistMealSubstitutionQuerySchema.parse({
      patientId: searchParams.get("patientId") ?? undefined,
    });
    const substitutions = await listNutritionistMealSubstitutions(
      user.userId,
      patientId,
    );

    return jsonResponse(substitutions);
  } catch (error) {
    return handleRouteError(error);
  }
}

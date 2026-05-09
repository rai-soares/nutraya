import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { listMealPlansForPatient } from "@/modules/meal-plans/meal-plan.service";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const { patientId } = await context.params;
    const mealPlans = await listMealPlansForPatient(user.userId, patientId);

    return jsonResponse(mealPlans);
  } catch (error) {
    return handleRouteError(error);
  }
}

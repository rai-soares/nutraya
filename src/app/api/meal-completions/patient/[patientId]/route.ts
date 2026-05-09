import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getCompletedMealsForLinkedPatientByDate } from "@/modules/meal-completions/meal-completion.service";
import { mealCompletionQuerySchema } from "@/modules/meal-completions/meal-completion.types";

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
    const { searchParams } = new URL(request.url);
    const { date } = mealCompletionQuerySchema.parse({
      date: searchParams.get("date"),
    });
    const completions = await getCompletedMealsForLinkedPatientByDate(
      user.userId,
      patientId,
      date,
    );

    return jsonResponse(completions);
  } catch (error) {
    return handleRouteError(error);
  }
}

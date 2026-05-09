import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  getCompletedMealsForDate,
  markMealAsCompleted,
  unmarkMealAsCompleted,
} from "@/modules/meal-completions/meal-completion.service";
import {
  mealCompletionBodySchema,
  mealCompletionQuerySchema,
} from "@/modules/meal-completions/meal-completion.types";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const body = await request.json();
    const input = mealCompletionBodySchema.parse(body);
    const completion = await markMealAsCompleted(
      user.userId,
      input.mealId,
      input.date,
    );

    return jsonResponse(completion, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const body = await request.json();
    const input = mealCompletionBodySchema.parse(body);
    await unmarkMealAsCompleted(user.userId, input.mealId, input.date);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const { searchParams } = new URL(request.url);
    const { date } = mealCompletionQuerySchema.parse({
      date: searchParams.get("date"),
    });
    const completions = await getCompletedMealsForDate(user.userId, date);

    return jsonResponse(completions);
  } catch (error) {
    return handleRouteError(error);
  }
}

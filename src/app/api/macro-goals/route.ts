import { handleRouteError, jsonResponse } from "@/lib/http";
import { createMacroGoal } from "@/modules/macro-goals/macro-goal.service";
import { createMacroGoalSchema } from "@/modules/macro-goals/macro-goal.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createMacroGoalSchema.parse(body);
    const goal = await createMacroGoal(input);

    return jsonResponse(goal, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

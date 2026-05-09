import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { createMacroGoal } from "@/modules/macro-goals/macro-goal.service";
import { createMacroGoalSchema } from "@/modules/macro-goals/macro-goal.types";
import { assertNutritionistCanAccessPatient } from "@/modules/patient-profile/patient-profile.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const body = await request.json();
    const input = createMacroGoalSchema.parse(body);
    await assertNutritionistCanAccessPatient(user.userId, input.patientId);
    const goal = await createMacroGoal(input);

    return jsonResponse(goal, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

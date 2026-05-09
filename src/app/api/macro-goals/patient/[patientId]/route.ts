import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  getMacroGoalByPatientId,
  updateMacroGoal,
} from "@/modules/macro-goals/macro-goal.service";
import { updateMacroGoalSchema } from "@/modules/macro-goals/macro-goal.types";
import { assertNutritionistCanAccessPatient } from "@/modules/patient-profile/patient-profile.service";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { patientId } = await context.params;

    if (user.role === "PATIENT" && user.userId !== patientId) {
      throw new AppError("Insufficient permissions.", 403);
    }

    if (user.role === "NUTRI") {
      await assertNutritionistCanAccessPatient(user.userId, patientId);
    }

    const goal = await getMacroGoalByPatientId(patientId);

    return jsonResponse(goal);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { patientId } = await context.params;

    if (user.role !== "NUTRI") {
      throw new AppError("Insufficient permissions.", 403);
    }

    await assertNutritionistCanAccessPatient(user.userId, patientId);

    const body = await request.json();
    const input = updateMacroGoalSchema.parse(body);
    const goal = await updateMacroGoal(patientId, input);

    return jsonResponse(goal);
  } catch (error) {
    return handleRouteError(error);
  }
}

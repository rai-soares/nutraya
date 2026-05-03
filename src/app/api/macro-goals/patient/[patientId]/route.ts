import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getMacroGoalByPatientId } from "@/modules/macro-goals/macro-goal.service";

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

    const goal = await getMacroGoalByPatientId(patientId);

    return jsonResponse(goal);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { handleRouteError, jsonResponse } from "@/lib/http";
import { getMacroGoalByPatientId } from "@/modules/macro-goals/macro-goal.service";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { patientId } = await context.params;
    const goal = await getMacroGoalByPatientId(patientId);

    return jsonResponse(goal);
  } catch (error) {
    return handleRouteError(error);
  }
}

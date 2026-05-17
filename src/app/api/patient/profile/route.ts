import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getPatientNutritionistSummaryByUserId } from "@/modules/patient-profile/patient-profile.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const profile = await getPatientNutritionistSummaryByUserId(user.userId);

    return jsonResponse(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

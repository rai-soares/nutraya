import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getLinkedPatientForNutritionist } from "@/modules/patient-profile/patient-profile.service";

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
    const patient = await getLinkedPatientForNutritionist(user.userId, patientId);

    return jsonResponse(patient);
  } catch (error) {
    return handleRouteError(error);
  }
}

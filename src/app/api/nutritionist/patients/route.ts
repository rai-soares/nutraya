import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  createOrLinkPatientForNutritionist,
  listPatientsForNutritionist,
} from "@/modules/patient-profile/patient-profile.service";
import { createNutritionistPatientSchema } from "@/modules/patient-profile/patient-profile.types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const patients = await listPatientsForNutritionist(user.userId);

    return jsonResponse(patients);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const body = await request.json();
    const input = createNutritionistPatientSchema.parse(body);
    const patient = await createOrLinkPatientForNutritionist(user.userId, input);

    return jsonResponse(patient, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

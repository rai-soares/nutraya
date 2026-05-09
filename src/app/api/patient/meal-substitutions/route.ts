import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  createMealSubstitution,
  listPatientMealSubstitutions,
} from "@/modules/meal-substitutions/meal-substitution.service";
import { patientMealSubstitutionBodySchema } from "@/modules/meal-substitutions/meal-substitution.types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const substitutions = await listPatientMealSubstitutions(user.userId);

    return jsonResponse(substitutions);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const body = await request.json();
    const input = patientMealSubstitutionBodySchema.parse(body);
    const substitution = await createMealSubstitution(user.userId, input);

    return jsonResponse(substitution, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

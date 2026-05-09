import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  assertNutritionistCanViewPatient,
  getPatientProgressByDate,
} from "@/modules/daily-macro-logs/daily-macro-log.service";
import { dailyMacroLogDateQuerySchema } from "@/modules/daily-macro-logs/daily-macro-log.types";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    const { patientId } = await context.params;
    const { searchParams } = new URL(request.url);
    const { date } = dailyMacroLogDateQuerySchema.parse({
      date: searchParams.get("date"),
    });

    if (user.role === "PATIENT") {
      if (user.userId !== patientId) {
        throw new AppError("Insufficient permissions.", 403);
      }
    } else {
      await assertNutritionistCanViewPatient(user.userId, patientId);
    }

    const progress = await getPatientProgressByDate(patientId, date);

    return jsonResponse(progress);
  } catch (error) {
    return handleRouteError(error);
  }
}

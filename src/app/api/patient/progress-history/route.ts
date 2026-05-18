import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getPatientProgressHistory } from "@/modules/daily-macro-logs/daily-macro-log.service";
import { progressHistoryRangeSchema } from "@/modules/daily-macro-logs/daily-macro-log.types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    if (user.role !== "PATIENT") {
      throw new AppError("Insufficient permissions.", 403);
    }

    const { searchParams } = new URL(request.url);
    const range = progressHistoryRangeSchema.parse(searchParams.get("range") ?? "7");
    const progressHistory = await getPatientProgressHistory(user.userId, range);

    return jsonResponse(progressHistory);
  } catch (error) {
    return handleRouteError(error);
  }
}

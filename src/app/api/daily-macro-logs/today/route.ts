import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  getTodayDailyMacroLog,
  upsertTodayDailyMacroLog,
} from "@/modules/daily-macro-logs/daily-macro-log.service";
import { upsertTodayDailyMacroLogSchema } from "@/modules/daily-macro-logs/daily-macro-log.types";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const body = await request.json();
    const input = upsertTodayDailyMacroLogSchema.parse(body);
    const log = await upsertTodayDailyMacroLog(user.userId, input);

    return jsonResponse(log, 200);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const log = await getTodayDailyMacroLog(user.userId);

    return jsonResponse(log);
  } catch (error) {
    return handleRouteError(error);
  }
}

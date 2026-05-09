import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { markPatientMessagesAsRead } from "@/modules/chat/chat.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const result = await markPatientMessagesAsRead(user.userId);

    return jsonResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

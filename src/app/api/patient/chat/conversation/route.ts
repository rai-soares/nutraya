import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getPatientConversation } from "@/modules/chat/chat.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const conversation = await getPatientConversation(user.userId);

    return jsonResponse(conversation);
  } catch (error) {
    return handleRouteError(error);
  }
}

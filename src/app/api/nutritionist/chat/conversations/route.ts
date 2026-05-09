import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { listNutritionistConversations } from "@/modules/chat/chat.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const conversations = await listNutritionistConversations(user.userId);

    return jsonResponse(conversations);
  } catch (error) {
    return handleRouteError(error);
  }
}

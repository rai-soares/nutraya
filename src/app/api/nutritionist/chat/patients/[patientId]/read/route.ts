import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { markNutritionistConversationAsRead } from "@/modules/chat/chat.service";
import { patientConversationParamSchema } from "@/modules/chat/chat.types";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const params = await context.params;
    const { patientId } = patientConversationParamSchema.parse(params);
    const result = await markNutritionistConversationAsRead(
      user.userId,
      patientId,
    );

    return jsonResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

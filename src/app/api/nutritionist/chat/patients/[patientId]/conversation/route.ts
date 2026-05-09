import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { getNutritionistConversationByPatientId } from "@/modules/chat/chat.service";
import { patientConversationParamSchema } from "@/modules/chat/chat.types";

type RouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const params = await context.params;
    const { patientId } = patientConversationParamSchema.parse(params);
    const conversation = await getNutritionistConversationByPatientId(
      user.userId,
      patientId,
    );

    return jsonResponse(conversation);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  listNutritionistConversationMessages,
  sendNutritionistMessage,
} from "@/modules/chat/chat.service";
import {
  patientConversationParamSchema,
  sendMessageSchema,
} from "@/modules/chat/chat.types";

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
    const messages = await listNutritionistConversationMessages(
      user.userId,
      patientId,
    );

    return jsonResponse(messages);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "NUTRI");

    const params = await context.params;
    const { patientId } = patientConversationParamSchema.parse(params);
    const body = await request.json();
    const input = sendMessageSchema.parse(body);
    const message = await sendNutritionistMessage(
      user.userId,
      patientId,
      input.text,
    );

    return jsonResponse(message, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

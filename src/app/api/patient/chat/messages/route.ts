import { requireAuth, requireRole } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import {
  listPatientMessages,
  sendPatientMessage,
} from "@/modules/chat/chat.service";
import { sendMessageSchema } from "@/modules/chat/chat.types";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const messages = await listPatientMessages(user.userId);

    return jsonResponse(messages);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user, "PATIENT");

    const body = await request.json();
    const input = sendMessageSchema.parse(body);
    const message = await sendPatientMessage(user.userId, input.text);

    return jsonResponse(message, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

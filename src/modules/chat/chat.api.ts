import { apiClient } from "@/modules/shared/api/api-client";
import type {
  ChatMessage,
  Conversation,
  ConversationListItem,
  MarkMessagesReadResponse,
} from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export type SendChatMessagePayload =
  | {
      messageType: "TEXT";
      text: string;
    }
  | {
      messageType: "IMAGE";
      imageUrl: string;
      text?: string;
    };

export type UploadImageResponse = {
  imageUrl: string;
};

export function getPatientConversation(options: AuthOptions) {
  return apiClient.get<Conversation>("/api/patient/chat/conversation", options);
}

export function listPatientMessages(options: AuthOptions) {
  return apiClient.get<ChatMessage[]>("/api/patient/chat/messages", options);
}

export function sendPatientMessage(
  payload: SendChatMessagePayload,
  options: AuthOptions,
) {
  return apiClient.post<ChatMessage>("/api/patient/chat/messages", payload, options);
}

export function markPatientMessagesAsRead(options: AuthOptions) {
  return apiClient.post<MarkMessagesReadResponse>(
    "/api/patient/chat/read",
    undefined,
    options,
  );
}

export function listNutritionistConversations(options: AuthOptions) {
  return apiClient.get<ConversationListItem[]>(
    "/api/nutritionist/chat/conversations",
    options,
  );
}

export function getNutritionistConversation(
  patientId: string,
  options: AuthOptions,
) {
  return apiClient.get<Conversation>(
    `/api/nutritionist/chat/patients/${patientId}/conversation`,
    options,
  );
}

export function listNutritionistMessages(
  patientId: string,
  options: AuthOptions,
) {
  return apiClient.get<ChatMessage[]>(
    `/api/nutritionist/chat/patients/${patientId}/messages`,
    options,
  );
}

export function sendNutritionistMessage(
  patientId: string,
  payload: SendChatMessagePayload,
  options: AuthOptions,
) {
  return apiClient.post<ChatMessage>(
    `/api/nutritionist/chat/patients/${patientId}/messages`,
    payload,
    options,
  );
}

export function markNutritionistMessagesAsRead(
  patientId: string,
  options: AuthOptions,
) {
  return apiClient.post<MarkMessagesReadResponse>(
    `/api/nutritionist/chat/patients/${patientId}/read`,
    undefined,
    options,
  );
}

export async function uploadImage(file: File, options: AuthOptions) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post<UploadImageResponse>(
    "/api/uploads/images",
    formData,
    options,
  );
}

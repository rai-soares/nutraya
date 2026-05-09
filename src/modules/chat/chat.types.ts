import { z } from "zod";

const requiredText = (field: string) =>
  z.string().trim().min(1, `${field} is required.`);

export const sendMessageSchema = z.object({
  text: requiredText("Message text").max(2000, "Message text is too long."),
});

export const patientConversationParamSchema = z.object({
  patientId: requiredText("Patient ID"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type PatientConversationParamInput = z.infer<
  typeof patientConversationParamSchema
>;

export type ConversationParticipantDto = {
  id: string;
  name: string;
  email: string;
  role: "NUTRI" | "PATIENT";
};

export type ConversationDto = {
  id: string;
  patientId: string;
  nutritionistId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  patient: ConversationParticipantDto;
  nutritionist: ConversationParticipantDto;
};

export type ConversationListItemDto = {
  conversationId: string;
  patientId: string;
  nutritionistId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  patient: ConversationParticipantDto;
  nutritionist: ConversationParticipantDto;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarkMessagesReadDto = {
  updatedCount: number;
};

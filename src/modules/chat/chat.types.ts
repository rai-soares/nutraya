import { z } from "zod";

const requiredText = (field: string) =>
  z.string().trim().min(1, `${field} is required.`);

const optionalCaption = z
  .string()
  .trim()
  .max(2000, "Message text is too long.")
  .optional();

export const sendMessageSchema = z.discriminatedUnion("messageType", [
  z.object({
    messageType: z.literal("TEXT"),
    text: requiredText("Message text").max(2000, "Message text is too long."),
  }),
  z.object({
    messageType: z.literal("IMAGE"),
    imageUrl: requiredText("Image URL").url("Image URL must be a valid URL."),
    text: optionalCaption,
  }),
]);

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
  messageType: "TEXT" | "IMAGE";
  text: string | null;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarkMessagesReadDto = {
  updatedCount: number;
};

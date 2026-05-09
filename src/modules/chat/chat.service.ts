import { Prisma, UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  assertNutritionistCanAccessPatient,
  getPatientProfileByUserId,
} from "@/modules/patient-profile/patient-profile.service";

import type {
  ConversationDto,
  ConversationListItemDto,
  ConversationParticipantDto,
  MarkMessagesReadDto,
  MessageDto,
  SendMessageInput,
} from "./chat.types";

const participantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const conversationSelect = {
  id: true,
  patientId: true,
  nutritionistId: true,
  lastMessageText: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
  patient: {
    select: participantSelect,
  },
  nutritionist: {
    select: participantSelect,
  },
} as const;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  receiverId: true,
  messageType: true,
  text: true,
  imageUrl: true,
  readAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type ConversationRecord = Prisma.ConversationGetPayload<{
  select: typeof conversationSelect;
}>;

type MessageRecord = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

function toParticipantDto(participant: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}): ConversationParticipantDto {
  return {
    id: participant.id,
    name: participant.name,
    email: participant.email,
    role: participant.role,
  };
}

function toConversationDto(
  conversation: ConversationRecord,
  unreadCount: number,
): ConversationDto {
  return {
    id: conversation.id,
    patientId: conversation.patientId,
    nutritionistId: conversation.nutritionistId,
    lastMessageText: conversation.lastMessageText,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    unreadCount,
    patient: toParticipantDto(conversation.patient),
    nutritionist: toParticipantDto(conversation.nutritionist),
  };
}

function toConversationListItemDto(
  conversation: ConversationRecord,
  unreadCount: number,
): ConversationListItemDto {
  return {
    conversationId: conversation.id,
    patientId: conversation.patientId,
    nutritionistId: conversation.nutritionistId,
    lastMessageText: conversation.lastMessageText,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    unreadCount,
    patient: toParticipantDto(conversation.patient),
    nutritionist: toParticipantDto(conversation.nutritionist),
  };
}

function toMessageDto(message: MessageRecord): MessageDto {
  return {
    ...message,
    readAt: message.readAt?.toISOString() ?? null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

async function assertNutritionistExists(nutritionistId: string): Promise<void> {
  const nutritionist = await prisma.user.findUnique({
    where: { id: nutritionistId },
    select: { id: true, role: true },
  });

  if (!nutritionist || nutritionist.role !== UserRole.NUTRI) {
    throw new AppError("Nutritionist user not found.", 404);
  }
}

async function getLinkedNutritionistIdForPatient(
  patientId: string,
): Promise<string> {
  const profile = await getPatientProfileByUserId(patientId);

  if (!profile) {
    throw new AppError("Patient is not linked to a nutritionist.", 404);
  }

  return profile.nutritionistId;
}

async function getConversationUnreadCount(
  conversationId: string,
  receiverId: string,
): Promise<number> {
  return prisma.message.count({
    where: {
      conversationId,
      receiverId,
      readAt: null,
    },
  });
}

async function findConversation(
  patientId: string,
  nutritionistId: string,
): Promise<ConversationRecord | null> {
  return prisma.conversation.findUnique({
    where: {
      patientId_nutritionistId: {
        patientId,
        nutritionistId,
      },
    },
    select: conversationSelect,
  });
}

async function createConversation(
  patientId: string,
  nutritionistId: string,
): Promise<ConversationRecord> {
  try {
    return await prisma.conversation.create({
      data: {
        patientId,
        nutritionistId,
      },
      select: conversationSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingConversation = await findConversation(patientId, nutritionistId);

      if (existingConversation) {
        return existingConversation;
      }
    }

    throw error;
  }
}

async function ensureConversation(
  patientId: string,
  nutritionistId: string,
): Promise<ConversationRecord> {
  const existingConversation = await findConversation(patientId, nutritionistId);

  if (existingConversation) {
    return existingConversation;
  }

  return createConversation(patientId, nutritionistId);
}

async function getMessagesForConversation(
  conversationId: string,
): Promise<MessageDto[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: messageSelect,
  });

  return messages.map(toMessageDto);
}

async function sendMessage(
  conversation: ConversationRecord,
  senderId: string,
  receiverId: string,
  input: SendMessageInput,
): Promise<MessageDto> {
  const isValidDirection =
    (senderId === conversation.patientId &&
      receiverId === conversation.nutritionistId) ||
    (senderId === conversation.nutritionistId &&
      receiverId === conversation.patientId);

  if (!isValidDirection) {
    throw new AppError("Message participants do not match the conversation.", 400);
  }

  if (input.messageType === "TEXT" && !input.text.trim()) {
    throw new AppError("Message text is required.", 400);
  }

  if (input.messageType === "IMAGE" && !input.imageUrl.trim()) {
    throw new AppError("Image URL is required.", 400);
  }

  const sentAt = new Date();
  const lastMessageText =
    input.messageType === "IMAGE"
      ? input.text?.trim() || "[Image]"
      : input.text;

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        messageType: input.messageType,
        text: input.text?.trim() || null,
        imageUrl: input.messageType === "IMAGE" ? input.imageUrl : null,
        createdAt: sentAt,
      },
      select: messageSelect,
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText,
        lastMessageAt: sentAt,
      },
    });

    return createdMessage;
  });

  return toMessageDto(message);
}

async function markConversationMessagesAsRead(
  conversationId: string,
  receiverId: string,
): Promise<MarkMessagesReadDto> {
  const readAt = new Date();
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId,
      readAt: null,
    },
    data: {
      readAt,
    },
  });

  return {
    updatedCount: result.count,
  };
}

export async function getPatientConversation(
  patientId: string,
): Promise<ConversationDto> {
  const nutritionistId = await getLinkedNutritionistIdForPatient(patientId);
  const conversation = await ensureConversation(patientId, nutritionistId);
  const unreadCount = await getConversationUnreadCount(conversation.id, patientId);

  return toConversationDto(conversation, unreadCount);
}

export async function listPatientMessages(
  patientId: string,
): Promise<MessageDto[]> {
  const conversation = await getPatientConversation(patientId);

  return getMessagesForConversation(conversation.id);
}

export async function sendPatientMessage(
  patientId: string,
  input: SendMessageInput,
): Promise<MessageDto> {
  const nutritionistId = await getLinkedNutritionistIdForPatient(patientId);
  const conversation = await ensureConversation(patientId, nutritionistId);

  return sendMessage(conversation, patientId, nutritionistId, input);
}

export async function markPatientMessagesAsRead(
  patientId: string,
): Promise<MarkMessagesReadDto> {
  const conversation = await getPatientConversation(patientId);

  return markConversationMessagesAsRead(conversation.id, patientId);
}

export async function listNutritionistConversations(
  nutritionistId: string,
): Promise<ConversationListItemDto[]> {
  await assertNutritionistExists(nutritionistId);

  const linkedPatients = await prisma.patientProfile.findMany({
    where: { nutritionistId },
    select: {
      userId: true,
    },
  });

  const conversations = await Promise.all(
    linkedPatients.map(async (profile) =>
      ensureConversation(profile.userId, nutritionistId),
    ),
  );

  const conversationsWithUnreadCounts = await Promise.all(
    conversations.map(async (conversation) => ({
      conversation,
      unreadCount: await getConversationUnreadCount(conversation.id, nutritionistId),
    })),
  );

  return conversationsWithUnreadCounts
    .sort((left, right) => {
      const rightTime = right.conversation.lastMessageAt?.getTime() ?? 0;
      const leftTime = left.conversation.lastMessageAt?.getTime() ?? 0;

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return left.conversation.patient.name.localeCompare(
        right.conversation.patient.name,
      );
    })
    .map(({ conversation, unreadCount }) =>
      toConversationListItemDto(conversation, unreadCount),
    );
}

export async function getNutritionistConversationByPatientId(
  nutritionistId: string,
  patientId: string,
): Promise<ConversationDto> {
  await assertNutritionistCanAccessPatient(nutritionistId, patientId);

  const conversation = await ensureConversation(patientId, nutritionistId);
  const unreadCount = await getConversationUnreadCount(
    conversation.id,
    nutritionistId,
  );

  return toConversationDto(conversation, unreadCount);
}

export async function listNutritionistConversationMessages(
  nutritionistId: string,
  patientId: string,
): Promise<MessageDto[]> {
  const conversation = await getNutritionistConversationByPatientId(
    nutritionistId,
    patientId,
  );

  return getMessagesForConversation(conversation.id);
}

export async function sendNutritionistMessage(
  nutritionistId: string,
  patientId: string,
  input: SendMessageInput,
): Promise<MessageDto> {
  await assertNutritionistCanAccessPatient(nutritionistId, patientId);

  const conversation = await ensureConversation(patientId, nutritionistId);

  return sendMessage(conversation, nutritionistId, patientId, input);
}

export async function markNutritionistConversationAsRead(
  nutritionistId: string,
  patientId: string,
): Promise<MarkMessagesReadDto> {
  const conversation = await getNutritionistConversationByPatientId(
    nutritionistId,
    patientId,
  );

  return markConversationMessagesAsRead(conversation.id, nutritionistId);
}

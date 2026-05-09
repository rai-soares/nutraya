import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getNutritionistConversationByPatientId,
  getPatientConversation,
  listNutritionistConversations,
  listPatientMessages,
  markNutritionistConversationAsRead,
  sendPatientMessage,
} from "@/modules/chat/chat.service";

const createdAt = new Date("2026-05-09T12:00:00.000Z");
const updatedAt = new Date("2026-05-09T12:30:00.000Z");

function buildConversationRecord(overrides?: Partial<{
  id: string;
  patientId: string;
  nutritionistId: string;
  lastMessageText: string | null;
  lastMessageAt: Date | null;
}>) {
  return {
    id: overrides?.id ?? "conversation-1",
    patientId: overrides?.patientId ?? "patient-1",
    nutritionistId: overrides?.nutritionistId ?? "nutri-1",
    lastMessageText: overrides?.lastMessageText ?? null,
    lastMessageAt: overrides?.lastMessageAt ?? null,
    createdAt,
    updatedAt,
    patient: {
      id: overrides?.patientId ?? "patient-1",
      name: "Ana Costa",
      email: "ana@example.com",
      role: UserRole.PATIENT,
    },
    nutritionist: {
      id: overrides?.nutritionistId ?? "nutri-1",
      name: "Dr. Silva",
      email: "silva@example.com",
      role: UserRole.NUTRI,
    },
  };
}

describe("chat service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a patient conversation on first access", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue(buildConversationRecord());
    prismaMock.message.count.mockResolvedValue(2);

    const result = await getPatientConversation("patient-1");

    expect(prismaMock.conversation.create).toHaveBeenCalledWith({
      data: {
        patientId: "patient-1",
        nutritionistId: "nutri-1",
      },
      select: expect.any(Object),
    });
    expect(result.unreadCount).toBe(2);
  });

  it("lists patient messages from the conversation", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(buildConversationRecord());
    prismaMock.message.count.mockResolvedValue(0);
    prismaMock.message.findMany.mockResolvedValue([
      {
        id: "message-1",
        conversationId: "conversation-1",
        senderId: "nutri-1",
        receiverId: "patient-1",
        messageType: "TEXT",
        text: "How are you feeling today?",
        imageUrl: null,
        readAt: null,
        createdAt,
        updatedAt,
      },
    ]);

    const result = await listPatientMessages("patient-1");

    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe("How are you feeling today?");
  });

  it("sends a patient message and updates conversation metadata", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(buildConversationRecord());
    prismaMock.message.create.mockResolvedValue({
      id: "message-1",
      conversationId: "conversation-1",
      senderId: "patient-1",
      receiverId: "nutri-1",
      messageType: "TEXT",
      text: "Lunch is done.",
      imageUrl: null,
      readAt: null,
      createdAt,
      updatedAt,
    });

    const result = await sendPatientMessage("patient-1", {
      messageType: "TEXT",
      text: "Lunch is done.",
    });

    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        conversationId: "conversation-1",
        senderId: "patient-1",
        receiverId: "nutri-1",
        messageType: "TEXT",
        text: "Lunch is done.",
        imageUrl: null,
      }),
      select: expect.any(Object),
    });
    expect(prismaMock.conversation.update).toHaveBeenCalledWith({
      where: { id: "conversation-1" },
      data: {
        lastMessageText: "Lunch is done.",
        lastMessageAt: expect.any(Date),
      },
    });
    expect(result.receiverId).toBe("nutri-1");
  });

  it("sends a patient image message and falls back conversation preview to [Image]", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(buildConversationRecord());
    prismaMock.message.create.mockResolvedValue({
      id: "message-2",
      conversationId: "conversation-1",
      senderId: "patient-1",
      receiverId: "nutri-1",
      messageType: "IMAGE",
      text: null,
      imageUrl: "https://cdn.example.com/lunch.jpg",
      readAt: null,
      createdAt,
      updatedAt,
    });

    const result = await sendPatientMessage("patient-1", {
      messageType: "IMAGE",
      imageUrl: "https://cdn.example.com/lunch.jpg",
    });

    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        messageType: "IMAGE",
        text: null,
        imageUrl: "https://cdn.example.com/lunch.jpg",
      }),
      select: expect.any(Object),
    });
    expect(prismaMock.conversation.update).toHaveBeenCalledWith({
      where: { id: "conversation-1" },
      data: {
        lastMessageText: "[Image]",
        lastMessageAt: expect.any(Date),
      },
    });
    expect(result.imageUrl).toBe("https://cdn.example.com/lunch.jpg");
  });

  it("lists nutritionist conversations for linked patients with unread counts", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "nutri-1",
      role: UserRole.NUTRI,
    });
    prismaMock.patientProfile.findMany.mockResolvedValue([
      { userId: "patient-1" },
      { userId: "patient-2" },
    ]);
    prismaMock.conversation.findUnique
      .mockResolvedValueOnce(
        buildConversationRecord({
          id: "conversation-1",
          patientId: "patient-1",
          lastMessageText: "First",
          lastMessageAt: new Date("2026-05-09T14:00:00.000Z"),
        }),
      )
      .mockResolvedValueOnce(
        buildConversationRecord({
          id: "conversation-2",
          patientId: "patient-2",
          lastMessageText: "Second",
          lastMessageAt: new Date("2026-05-09T15:00:00.000Z"),
        }),
      );
    prismaMock.message.count.mockResolvedValueOnce(1).mockResolvedValueOnce(3);

    const result = await listNutritionistConversations("nutri-1");

    expect(result).toHaveLength(2);
    expect(result[0]?.patientId).toBe("patient-2");
    expect(result[0]?.unreadCount).toBe(3);
  });

  it("returns a nutritionist conversation only for a linked patient", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "nutri-1",
        role: UserRole.NUTRI,
      })
      .mockResolvedValueOnce({
        id: "patient-1",
        role: UserRole.PATIENT,
      });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(buildConversationRecord());
    prismaMock.message.count.mockResolvedValue(0);

    const result = await getNutritionistConversationByPatientId(
      "nutri-1",
      "patient-1",
    );

    expect(result.patientId).toBe("patient-1");
  });

  it("marks nutritionist received messages as read", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "nutri-1",
        role: UserRole.NUTRI,
      })
      .mockResolvedValueOnce({
        id: "patient-1",
        role: UserRole.PATIENT,
      });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.conversation.findUnique.mockResolvedValue(buildConversationRecord());
    prismaMock.message.count.mockResolvedValue(2);
    prismaMock.message.updateMany.mockResolvedValue({
      count: 2,
    });

    const result = await markNutritionistConversationAsRead(
      "nutri-1",
      "patient-1",
    );

    expect(prismaMock.message.updateMany).toHaveBeenCalledWith({
      where: {
        conversationId: "conversation-1",
        receiverId: "nutri-1",
        readAt: null,
      },
      data: {
        readAt: expect.any(Date),
      },
    });
    expect(result.updatedCount).toBe(2);
  });
});

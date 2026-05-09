import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listNutritionistConversationMessagesMock,
  requireAuthMock,
  requireRoleMock,
  sendNutritionistMessageMock,
} = vi.hoisted(() => ({
  listNutritionistConversationMessagesMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
  sendNutritionistMessageMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  listNutritionistConversationMessages:
    listNutritionistConversationMessagesMock,
  sendNutritionistMessage: sendNutritionistMessageMock,
}));

import { GET, POST } from "@/app/api/nutritionist/chat/patients/[patientId]/messages/route";

describe("/api/nutritionist/chat/patients/[patientId]/messages route", () => {
  beforeEach(() => {
    listNutritionistConversationMessagesMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    sendNutritionistMessageMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("lists messages for a linked patient conversation", async () => {
    listNutritionistConversationMessagesMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/nutritionist/chat/patients/patient-1/messages"),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(listNutritionistConversationMessagesMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(response.status).toBe(200);
  });

  it("sends a nutritionist message", async () => {
    sendNutritionistMessageMock.mockResolvedValue({
      id: "message-1",
    });

    const response = await POST(
      new Request("http://localhost/api/nutritionist/chat/patients/patient-1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "TEXT",
          text: "Please keep hydration high today.",
        }),
      }),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(sendNutritionistMessageMock).toHaveBeenCalledWith("nutri-1", "patient-1", {
      messageType: "TEXT",
      text: "Please keep hydration high today.",
    });
    expect(response.status).toBe(201);
  });

  it("sends a nutritionist image message", async () => {
    sendNutritionistMessageMock.mockResolvedValue({
      id: "message-2",
    });

    const response = await POST(
      new Request("http://localhost/api/nutritionist/chat/patients/patient-1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "IMAGE",
          imageUrl: "https://cdn.example.com/progress.jpg",
        }),
      }),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(sendNutritionistMessageMock).toHaveBeenCalledWith("nutri-1", "patient-1", {
      messageType: "IMAGE",
      imageUrl: "https://cdn.example.com/progress.jpg",
    });
    expect(response.status).toBe(201);
  });
});

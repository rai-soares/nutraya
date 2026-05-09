import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  markNutritionistConversationAsReadMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  markNutritionistConversationAsReadMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  markNutritionistConversationAsRead: markNutritionistConversationAsReadMock,
}));

import { POST } from "@/app/api/nutritionist/chat/patients/[patientId]/read/route";

describe("/api/nutritionist/chat/patients/[patientId]/read route", () => {
  beforeEach(() => {
    markNutritionistConversationAsReadMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("marks received nutritionist messages as read", async () => {
    markNutritionistConversationAsReadMock.mockResolvedValue({
      updatedCount: 1,
    });

    const response = await POST(
      new Request("http://localhost/api/nutritionist/chat/patients/patient-1/read", {
        method: "POST",
      }),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(markNutritionistConversationAsReadMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(response.status).toBe(200);
  });
});

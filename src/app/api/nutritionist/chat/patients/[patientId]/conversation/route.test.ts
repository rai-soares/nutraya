import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getNutritionistConversationByPatientIdMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getNutritionistConversationByPatientIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  getNutritionistConversationByPatientId:
    getNutritionistConversationByPatientIdMock,
}));

import { GET } from "@/app/api/nutritionist/chat/patients/[patientId]/conversation/route";

describe("/api/nutritionist/chat/patients/[patientId]/conversation route", () => {
  beforeEach(() => {
    getNutritionistConversationByPatientIdMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns the nutritionist conversation for a linked patient", async () => {
    getNutritionistConversationByPatientIdMock.mockResolvedValue({
      id: "conversation-1",
    });

    const response = await GET(
      new Request("http://localhost/api/nutritionist/chat/patients/patient-1/conversation"),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(getNutritionistConversationByPatientIdMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(response.status).toBe(200);
  });
});

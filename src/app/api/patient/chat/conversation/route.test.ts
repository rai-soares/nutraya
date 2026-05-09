import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPatientConversationMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    getPatientConversationMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  getPatientConversation: getPatientConversationMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/patient/chat/conversation/route";

describe("/api/patient/chat/conversation route", () => {
  beforeEach(() => {
    getPatientConversationMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns the authenticated patient conversation", async () => {
    getPatientConversationMock.mockResolvedValue({
      id: "conversation-1",
    });

    const response = await GET(
      new Request("http://localhost/api/patient/chat/conversation"),
    );

    expect(getPatientConversationMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    requireAuthMock.mockRejectedValue(new AppError("Authentication required.", 401));

    const response = await GET(
      new Request("http://localhost/api/patient/chat/conversation"),
    );

    expect(response.status).toBe(401);
  });
});

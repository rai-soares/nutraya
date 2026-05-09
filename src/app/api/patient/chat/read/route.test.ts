import { beforeEach, describe, expect, it, vi } from "vitest";

const { markPatientMessagesAsReadMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    markPatientMessagesAsReadMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  markPatientMessagesAsRead: markPatientMessagesAsReadMock,
}));

import { POST } from "@/app/api/patient/chat/read/route";

describe("/api/patient/chat/read route", () => {
  beforeEach(() => {
    markPatientMessagesAsReadMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("marks received patient messages as read", async () => {
    markPatientMessagesAsReadMock.mockResolvedValue({
      updatedCount: 3,
    });

    const response = await POST(
      new Request("http://localhost/api/patient/chat/read", {
        method: "POST",
      }),
    );

    expect(markPatientMessagesAsReadMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });
});

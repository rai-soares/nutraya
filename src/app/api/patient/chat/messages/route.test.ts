import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listPatientMessagesMock,
  requireAuthMock,
  requireRoleMock,
  sendPatientMessageMock,
} = vi.hoisted(() => ({
  listPatientMessagesMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
  sendPatientMessageMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  listPatientMessages: listPatientMessagesMock,
  sendPatientMessage: sendPatientMessageMock,
}));

import { GET, POST } from "@/app/api/patient/chat/messages/route";

describe("/api/patient/chat/messages route", () => {
  beforeEach(() => {
    listPatientMessagesMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    sendPatientMessageMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("lists patient messages", async () => {
    listPatientMessagesMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/patient/chat/messages"),
    );

    expect(listPatientMessagesMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });

  it("sends a patient message", async () => {
    sendPatientMessageMock.mockResolvedValue({
      id: "message-1",
    });

    const response = await POST(
      new Request("http://localhost/api/patient/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "TEXT",
          text: "Checking in",
        }),
      }),
    );

    expect(sendPatientMessageMock).toHaveBeenCalledWith("patient-1", {
      messageType: "TEXT",
      text: "Checking in",
    });
    expect(response.status).toBe(201);
  });

  it("sends a patient image message", async () => {
    sendPatientMessageMock.mockResolvedValue({
      id: "message-2",
    });

    const response = await POST(
      new Request("http://localhost/api/patient/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "IMAGE",
          imageUrl: "https://cdn.example.com/lunch.jpg",
          text: "Lunch",
        }),
      }),
    );

    expect(sendPatientMessageMock).toHaveBeenCalledWith("patient-1", {
      messageType: "IMAGE",
      imageUrl: "https://cdn.example.com/lunch.jpg",
      text: "Lunch",
    });
    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/patient/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: "TEXT",
          text: "   ",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(sendPatientMessageMock).not.toHaveBeenCalled();
  });
});

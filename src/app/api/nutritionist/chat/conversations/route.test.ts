import { beforeEach, describe, expect, it, vi } from "vitest";

const { listNutritionistConversationsMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    listNutritionistConversationsMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/chat/chat.service", () => ({
  listNutritionistConversations: listNutritionistConversationsMock,
}));

import { GET } from "@/app/api/nutritionist/chat/conversations/route";

describe("/api/nutritionist/chat/conversations route", () => {
  beforeEach(() => {
    listNutritionistConversationsMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("lists nutritionist conversations", async () => {
    listNutritionistConversationsMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/nutritionist/chat/conversations"),
    );

    expect(listNutritionistConversationsMock).toHaveBeenCalledWith("nutri-1");
    expect(response.status).toBe(200);
  });
});

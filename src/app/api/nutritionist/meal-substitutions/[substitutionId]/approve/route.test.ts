import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  approveMealSubstitutionMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  approveMealSubstitutionMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  approveMealSubstitution: approveMealSubstitutionMock,
}));

import { POST } from "@/app/api/nutritionist/meal-substitutions/[substitutionId]/approve/route";

describe("/api/nutritionist/meal-substitutions/[substitutionId]/approve route", () => {
  beforeEach(() => {
    approveMealSubstitutionMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("approves a substitution request", async () => {
    approveMealSubstitutionMock.mockResolvedValue({ id: "sub-1" });

    const response = await POST(
      new Request(
        "http://localhost/api/nutritionist/meal-substitutions/sub-1/approve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nutritionistFeedback: "Approved for today.",
          }),
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(approveMealSubstitutionMock).toHaveBeenCalledWith("nutri-1", "sub-1", {
      nutritionistFeedback: "Approved for today.",
    });
    expect(response.status).toBe(200);
  });
});

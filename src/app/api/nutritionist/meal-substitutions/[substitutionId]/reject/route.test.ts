import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  rejectMealSubstitutionMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  rejectMealSubstitutionMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  rejectMealSubstitution: rejectMealSubstitutionMock,
}));

import { POST } from "@/app/api/nutritionist/meal-substitutions/[substitutionId]/reject/route";

describe("/api/nutritionist/meal-substitutions/[substitutionId]/reject route", () => {
  beforeEach(() => {
    rejectMealSubstitutionMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("rejects a substitution request", async () => {
    rejectMealSubstitutionMock.mockResolvedValue({ id: "sub-1" });

    const response = await POST(
      new Request(
        "http://localhost/api/nutritionist/meal-substitutions/sub-1/reject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nutritionistFeedback: "Please keep the original meal today.",
          }),
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(rejectMealSubstitutionMock).toHaveBeenCalledWith("nutri-1", "sub-1", {
      nutritionistFeedback: "Please keep the original meal today.",
    });
    expect(response.status).toBe(200);
  });
});

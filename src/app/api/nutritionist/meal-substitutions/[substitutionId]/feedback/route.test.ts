import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  saveNutritionistMealSubstitutionFeedbackMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  saveNutritionistMealSubstitutionFeedbackMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  saveNutritionistMealSubstitutionFeedback:
    saveNutritionistMealSubstitutionFeedbackMock,
}));

import { POST } from "@/app/api/nutritionist/meal-substitutions/[substitutionId]/feedback/route";

describe("/api/nutritionist/meal-substitutions/[substitutionId]/feedback route", () => {
  beforeEach(() => {
    saveNutritionistMealSubstitutionFeedbackMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("saves feedback for a substitution", async () => {
    saveNutritionistMealSubstitutionFeedbackMock.mockResolvedValue({ id: "sub-1" });

    const response = await POST(
      new Request(
        "http://localhost/api/nutritionist/meal-substitutions/sub-1/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nutritionistFeedback: "Keep the same protein source next time.",
          }),
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(saveNutritionistMealSubstitutionFeedbackMock).toHaveBeenCalledWith(
      "nutri-1",
      "sub-1",
      {
        nutritionistFeedback: "Keep the same protein source next time.",
      },
    );
    expect(response.status).toBe(200);
  });
});

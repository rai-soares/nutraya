import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  estimateNutritionistMealSubstitutionMacrosMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  estimateNutritionistMealSubstitutionMacrosMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  estimateNutritionistMealSubstitutionMacros:
    estimateNutritionistMealSubstitutionMacrosMock,
}));

import { POST } from "@/app/api/nutritionist/meal-substitutions/[substitutionId]/estimate-macros/route";

describe("/api/nutritionist/meal-substitutions/[substitutionId]/estimate-macros route", () => {
  beforeEach(() => {
    estimateNutritionistMealSubstitutionMacrosMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("estimates macros for a nutritionist-visible substitution request", async () => {
    estimateNutritionistMealSubstitutionMacrosMock.mockResolvedValue({
      substitutionId: "sub-1",
    });

    const response = await POST(
      new Request(
        "http://localhost/api/nutritionist/meal-substitutions/sub-1/estimate-macros",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: true }),
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(estimateNutritionistMealSubstitutionMacrosMock).toHaveBeenCalledWith(
      "nutri-1",
      "sub-1",
      { force: true },
    );
    expect(response.status).toBe(200);
  });
});

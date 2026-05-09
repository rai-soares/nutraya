import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getNutritionistMealSubstitutionByIdMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getNutritionistMealSubstitutionByIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  getNutritionistMealSubstitutionById: getNutritionistMealSubstitutionByIdMock,
}));

import { GET } from "@/app/api/nutritionist/meal-substitutions/[substitutionId]/route";

describe("/api/nutritionist/meal-substitutions/[substitutionId] route", () => {
  beforeEach(() => {
    getNutritionistMealSubstitutionByIdMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns one substitution request for the authenticated nutritionist", async () => {
    getNutritionistMealSubstitutionByIdMock.mockResolvedValue({ id: "sub-1" });

    const response = await GET(
      new Request("http://localhost/api/nutritionist/meal-substitutions/sub-1"),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(getNutritionistMealSubstitutionByIdMock).toHaveBeenCalledWith(
      "nutri-1",
      "sub-1",
    );
    expect(response.status).toBe(200);
  });
});

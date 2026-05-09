import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listNutritionistMealSubstitutionsMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  listNutritionistMealSubstitutionsMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  listNutritionistMealSubstitutions: listNutritionistMealSubstitutionsMock,
}));

import { GET } from "@/app/api/nutritionist/meal-substitutions/route";

describe("/api/nutritionist/meal-substitutions route", () => {
  beforeEach(() => {
    listNutritionistMealSubstitutionsMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("lists substitution requests for the authenticated nutritionist", async () => {
    listNutritionistMealSubstitutionsMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/nutritionist/meal-substitutions"),
    );

    expect(listNutritionistMealSubstitutionsMock).toHaveBeenCalledWith(
      "nutri-1",
      undefined,
    );
    expect(response.status).toBe(200);
  });

  it("supports filtering requests by patientId", async () => {
    listNutritionistMealSubstitutionsMock.mockResolvedValue([]);

    await GET(
      new Request(
        "http://localhost/api/nutritionist/meal-substitutions?patientId=patient-1",
      ),
    );

    expect(listNutritionistMealSubstitutionsMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
  });
});

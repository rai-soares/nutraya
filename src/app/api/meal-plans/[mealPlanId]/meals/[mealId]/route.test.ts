import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteMealMock, requireAuthMock, requireRoleMock, updateMealMock } =
  vi.hoisted(() => ({
    deleteMealMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
    updateMealMock: vi.fn(),
  }));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  deleteMeal: deleteMealMock,
  updateMeal: updateMealMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { DELETE, PATCH } from "@/app/api/meal-plans/[mealPlanId]/meals/[mealId]/route";

describe("/api/meal-plans/[mealPlanId]/meals/[mealId] route", () => {
  beforeEach(() => {
    deleteMealMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    updateMealMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("updates a meal", async () => {
    updateMealMock.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
      name: "Lunch",
      description: null,
      scheduledTime: "12:00",
      order: 2,
      calories: 700,
      protein: 45,
      carbs: 75,
      fat: 20,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
    });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calories: 700,
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ mealPlanId: "plan-1", mealId: "meal-1" }),
    });

    expect(response.status).toBe(200);
    expect(updateMealMock).toHaveBeenCalledWith("nutri-1", "plan-1", "meal-1", {
      calories: 700,
    });
  });

  it("deletes a meal", async () => {
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ mealPlanId: "plan-1", mealId: "meal-1" }),
    });

    expect(response.status).toBe(200);
    expect(deleteMealMock).toHaveBeenCalledWith("nutri-1", "plan-1", "meal-1");
  });
});

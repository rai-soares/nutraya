import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMealMock, requireAuthMock, requireRoleMock } = vi.hoisted(
  () => ({
    createMealMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }),
);

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  createMeal: createMealMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { POST } from "@/app/api/meal-plans/[mealPlanId]/meals/route";

describe("/api/meal-plans/[mealPlanId]/meals route", () => {
  beforeEach(() => {
    createMealMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("creates a meal", async () => {
    createMealMock.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
      name: "Breakfast",
      description: null,
      scheduledTime: "07:30",
      order: 0,
      calories: 450,
      protein: 30,
      carbs: 45,
      fat: 12,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
    });

    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Breakfast",
        scheduledTime: "07:30",
        order: 0,
        calories: 450,
        protein: 30,
        carbs: 45,
        fat: 12,
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ mealPlanId: "plan-1" }),
    });

    expect(response.status).toBe(201);
    expect(createMealMock).toHaveBeenCalledWith("nutri-1", "plan-1", {
      name: "Breakfast",
      scheduledTime: "07:30",
      order: 0,
      calories: 450,
      protein: 30,
      carbs: 45,
      fat: 12,
    });
  });
});

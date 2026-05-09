import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteMealPlanMock,
  getMealPlanByIdMock,
  requireAuthMock,
  requireRoleMock,
  updateMealPlanMock,
} = vi.hoisted(() => ({
  deleteMealPlanMock: vi.fn(),
  getMealPlanByIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
  updateMealPlanMock: vi.fn(),
}));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  deleteMealPlan: deleteMealPlanMock,
  getMealPlanById: getMealPlanByIdMock,
  updateMealPlan: updateMealPlanMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { DELETE, GET, PATCH } from "@/app/api/meal-plans/[mealPlanId]/route";

describe("/api/meal-plans/[mealPlanId] route", () => {
  beforeEach(() => {
    deleteMealPlanMock.mockReset();
    getMealPlanByIdMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    updateMealPlanMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a meal plan by id", async () => {
    getMealPlanByIdMock.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
      meals: [],
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ mealPlanId: "plan-1" }),
    });

    expect(response.status).toBe(200);
  });

  it("updates a meal plan", async () => {
    updateMealPlanMock.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Updated Plan",
      description: null,
      isActive: false,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
    });

    const request = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Updated Plan",
        isActive: false,
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ mealPlanId: "plan-1" }),
    });

    expect(response.status).toBe(200);
    expect(updateMealPlanMock).toHaveBeenCalledWith("nutri-1", "plan-1", {
      title: "Updated Plan",
      isActive: false,
    });
  });

  it("deletes a meal plan", async () => {
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ mealPlanId: "plan-1" }),
    });

    expect(response.status).toBe(200);
    expect(deleteMealPlanMock).toHaveBeenCalledWith("nutri-1", "plan-1");
  });
});

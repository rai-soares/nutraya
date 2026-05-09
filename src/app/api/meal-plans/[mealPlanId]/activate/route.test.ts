import { beforeEach, describe, expect, it, vi } from "vitest";

const { activateMealPlanMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    activateMealPlanMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  activateMealPlan: activateMealPlanMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { POST } from "@/app/api/meal-plans/[mealPlanId]/activate/route";

describe("/api/meal-plans/[mealPlanId]/activate route", () => {
  beforeEach(() => {
    activateMealPlanMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("activates a meal plan", async () => {
    activateMealPlanMock.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
    });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ mealPlanId: "plan-1" }),
    });

    expect(response.status).toBe(200);
    expect(activateMealPlanMock).toHaveBeenCalledWith("nutri-1", "plan-1");
  });
});

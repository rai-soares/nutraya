import { beforeEach, describe, expect, it, vi } from "vitest";

const { getActiveMealsForPatientMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    getActiveMealsForPatientMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  getActiveMealsForPatient: getActiveMealsForPatientMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/patient/meal-plan/active/meals/route";

describe("/api/patient/meal-plan/active/meals route", () => {
  beforeEach(() => {
    getActiveMealsForPatientMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns ordered meals from the active meal plan", async () => {
    getActiveMealsForPatientMock.mockResolvedValue([
      {
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
      },
    ]);

    const response = await GET(new Request("http://localhost"));

    expect(response.status).toBe(200);
    expect(getActiveMealsForPatientMock).toHaveBeenCalledWith("patient-1");
  });
});

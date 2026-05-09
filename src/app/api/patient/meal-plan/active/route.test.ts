import { beforeEach, describe, expect, it, vi } from "vitest";

const { getActiveMealPlanForPatientMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    getActiveMealPlanForPatientMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  getActiveMealPlanForPatient: getActiveMealPlanForPatientMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/patient/meal-plan/active/route";

describe("/api/patient/meal-plan/active route", () => {
  beforeEach(() => {
    getActiveMealPlanForPatientMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns the active meal plan for the authenticated patient", async () => {
    getActiveMealPlanForPatientMock.mockResolvedValue({
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

    const response = await GET(new Request("http://localhost"));

    expect(response.status).toBe(200);
    expect(getActiveMealPlanForPatientMock).toHaveBeenCalledWith("patient-1");
  });
});

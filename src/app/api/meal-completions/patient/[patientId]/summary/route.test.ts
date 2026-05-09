import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPatientMealCompletionSummaryByDateMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getPatientMealCompletionSummaryByDateMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/modules/meal-completions/meal-completion.service", () => ({
  getPatientMealCompletionSummaryByDate:
    getPatientMealCompletionSummaryByDateMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/meal-completions/patient/[patientId]/summary/route";

describe("/api/meal-completions/patient/[patientId]/summary route", () => {
  beforeEach(() => {
    getPatientMealCompletionSummaryByDateMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a patient's meal completion summary for a date", async () => {
    getPatientMealCompletionSummaryByDateMock.mockResolvedValue({
      date: "2026-05-09",
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
      },
      totalMeals: 3,
      completedMeals: 2,
      pendingMeals: 1,
      completedMealIds: ["meal-1", "meal-2"],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/meal-completions/patient/patient-1/summary?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(getPatientMealCompletionSummaryByDateMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });
});

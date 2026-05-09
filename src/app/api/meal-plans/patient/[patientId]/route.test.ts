import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listMealPlansForPatientMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  listMealPlansForPatientMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  listMealPlansForPatient: listMealPlansForPatientMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/meal-plans/patient/[patientId]/route";

describe("/api/meal-plans/patient/[patientId] route", () => {
  beforeEach(() => {
    listMealPlansForPatientMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("lists meal plans for a linked patient", async () => {
    listMealPlansForPatientMock.mockResolvedValue([
      {
        id: "plan-1",
        patientId: "patient-1",
        nutritionistId: "nutri-1",
        title: "Plan A",
        description: null,
        isActive: true,
        createdAt: "2026-05-09T12:00:00.000Z",
        updatedAt: "2026-05-09T12:30:00.000Z",
      },
    ]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(200);
    expect(listMealPlansForPatientMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
  });
});

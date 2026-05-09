import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCompletedMealsForLinkedPatientByDateMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getCompletedMealsForLinkedPatientByDateMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/modules/meal-completions/meal-completion.service", () => ({
  getCompletedMealsForLinkedPatientByDate:
    getCompletedMealsForLinkedPatientByDateMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/meal-completions/patient/[patientId]/route";

describe("/api/meal-completions/patient/[patientId] route", () => {
  beforeEach(() => {
    getCompletedMealsForLinkedPatientByDateMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a linked patient's completed meals for a date", async () => {
    getCompletedMealsForLinkedPatientByDateMock.mockResolvedValue([]);

    const response = await GET(
      new Request(
        "http://localhost/api/meal-completions/patient/patient-1?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(getCompletedMealsForLinkedPatientByDateMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });
});

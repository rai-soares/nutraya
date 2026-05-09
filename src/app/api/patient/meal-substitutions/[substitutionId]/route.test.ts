import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPatientMealSubstitutionByIdMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getPatientMealSubstitutionByIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  getPatientMealSubstitutionById: getPatientMealSubstitutionByIdMock,
}));

import { GET } from "@/app/api/patient/meal-substitutions/[substitutionId]/route";

describe("/api/patient/meal-substitutions/[substitutionId] route", () => {
  beforeEach(() => {
    getPatientMealSubstitutionByIdMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns the authenticated patient's substitution request by id", async () => {
    getPatientMealSubstitutionByIdMock.mockResolvedValue({ id: "sub-1" });

    const response = await GET(
      new Request("http://localhost/api/patient/meal-substitutions/sub-1"),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(getPatientMealSubstitutionByIdMock).toHaveBeenCalledWith(
      "patient-1",
      "sub-1",
    );
    expect(response.status).toBe(200);
  });
});

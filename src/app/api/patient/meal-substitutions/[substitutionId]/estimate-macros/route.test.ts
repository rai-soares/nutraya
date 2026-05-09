import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  estimatePatientMealSubstitutionMacrosMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  estimatePatientMealSubstitutionMacrosMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  estimatePatientMealSubstitutionMacros: estimatePatientMealSubstitutionMacrosMock,
}));

import { POST } from "@/app/api/patient/meal-substitutions/[substitutionId]/estimate-macros/route";

describe("/api/patient/meal-substitutions/[substitutionId]/estimate-macros route", () => {
  beforeEach(() => {
    estimatePatientMealSubstitutionMacrosMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("estimates macros for the authenticated patient's substitution request", async () => {
    estimatePatientMealSubstitutionMacrosMock.mockResolvedValue({
      substitutionId: "sub-1",
    });

    const response = await POST(
      new Request(
        "http://localhost/api/patient/meal-substitutions/sub-1/estimate-macros",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: true }),
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(estimatePatientMealSubstitutionMacrosMock).toHaveBeenCalledWith(
      "patient-1",
      "sub-1",
      { force: true },
    );
    expect(response.status).toBe(200);
  });

  it("accepts an empty body and defaults force to undefined", async () => {
    estimatePatientMealSubstitutionMacrosMock.mockResolvedValue({
      substitutionId: "sub-1",
    });

    const response = await POST(
      new Request(
        "http://localhost/api/patient/meal-substitutions/sub-1/estimate-macros",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({ substitutionId: "sub-1" }),
      },
    );

    expect(estimatePatientMealSubstitutionMacrosMock).toHaveBeenCalledWith(
      "patient-1",
      "sub-1",
      {},
    );
    expect(response.status).toBe(200);
  });
});

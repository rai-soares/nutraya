import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPatientNutritionistSummaryByUserIdMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getPatientNutritionistSummaryByUserIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  getPatientNutritionistSummaryByUserId: getPatientNutritionistSummaryByUserIdMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/patient/profile/route";

describe("/api/patient/profile route", () => {
  beforeEach(() => {
    getPatientNutritionistSummaryByUserIdMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns the authenticated patient profile summary", async () => {
    getPatientNutritionistSummaryByUserIdMock.mockResolvedValue({
      nutritionist: {
        id: "nutri-1",
        name: "Dra. Paula",
      },
    });

    const response = await GET(new Request("http://localhost/api/patient/profile"));

    expect(requireRoleMock).toHaveBeenCalledWith(
      { userId: "patient-1", role: "PATIENT" },
      "PATIENT",
    );
    expect(getPatientNutritionistSummaryByUserIdMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      nutritionist: {
        id: "nutri-1",
        name: "Dra. Paula",
      },
    });
  });

  it("returns 401 when unauthenticated", async () => {
    requireAuthMock.mockRejectedValue(new AppError("Authentication required.", 401));

    const response = await GET(new Request("http://localhost/api/patient/profile"));

    expect(response.status).toBe(401);
  });

  it("returns 403 when the authenticated user is not a patient", async () => {
    requireRoleMock.mockImplementation(() => {
      throw new AppError("Insufficient permissions.", 403);
    });

    const response = await GET(new Request("http://localhost/api/patient/profile"));

    expect(response.status).toBe(403);
  });
});

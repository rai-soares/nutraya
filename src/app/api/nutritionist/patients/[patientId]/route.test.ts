import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLinkedPatientForNutritionistMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    getLinkedPatientForNutritionistMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  getLinkedPatientForNutritionist: getLinkedPatientForNutritionistMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/nutritionist/patients/[patientId]/route";

describe("/api/nutritionist/patients/[patientId] route", () => {
  beforeEach(() => {
    getLinkedPatientForNutritionistMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a linked patient", async () => {
    getLinkedPatientForNutritionistMock.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
      patient: {
        id: "patient-1",
        name: "Ana Costa",
        email: "ana@example.com",
        role: "PATIENT",
        createdAt: "2026-05-09T10:00:00.000Z",
      },
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(getLinkedPatientForNutritionistMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(response.status).toBe(200);
  });

  it("returns 401 when not authenticated", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(401);
  });
});

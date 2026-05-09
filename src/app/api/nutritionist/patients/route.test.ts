import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createOrLinkPatientForNutritionistMock,
  listPatientsForNutritionistMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  createOrLinkPatientForNutritionistMock: vi.fn(),
  listPatientsForNutritionistMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  createOrLinkPatientForNutritionist: createOrLinkPatientForNutritionistMock,
  listPatientsForNutritionist: listPatientsForNutritionistMock,
}));

import { AppError } from "@/lib/errors";
import { GET, POST } from "@/app/api/nutritionist/patients/route";

describe("/api/nutritionist/patients route", () => {
  beforeEach(() => {
    createOrLinkPatientForNutritionistMock.mockReset();
    listPatientsForNutritionistMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("lists linked patients", async () => {
    listPatientsForNutritionistMock.mockResolvedValue([
      {
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
      },
    ]);

    const response = await GET(new Request("http://localhost/api/nutritionist/patients"));

    expect(listPatientsForNutritionistMock).toHaveBeenCalledWith("nutri-1");
    expect(response.status).toBe(200);
  });

  it("creates or links a patient", async () => {
    createOrLinkPatientForNutritionistMock.mockResolvedValue({
      patient: {
        id: "patient-1",
        name: "Ana Costa",
        email: "ana@example.com",
        role: "PATIENT",
        createdAt: "2026-05-09T10:00:00.000Z",
      },
      profile: {
        id: "profile-1",
        userId: "patient-1",
        nutritionistId: "nutri-1",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/nutritionist/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ana Costa",
          email: "ana@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(createOrLinkPatientForNutritionistMock).toHaveBeenCalledWith(
      "nutri-1",
      {
        name: "Ana Costa",
        email: "ana@example.com",
        password: "secret123",
      },
    );
    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/nutritionist/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "bad-email",
          password: "123",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createOrLinkPatientForNutritionistMock).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const response = await GET(new Request("http://localhost/api/nutritionist/patients"));

    expect(response.status).toBe(401);
  });
});

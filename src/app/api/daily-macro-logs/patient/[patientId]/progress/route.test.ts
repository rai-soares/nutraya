import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  assertNutritionistCanViewPatientMock,
  getPatientProgressByDateMock,
  requireAuthMock,
} = vi.hoisted(() => ({
  assertNutritionistCanViewPatientMock: vi.fn(),
  getPatientProgressByDateMock: vi.fn(),
  requireAuthMock: vi.fn(),
}));

vi.mock("@/modules/daily-macro-logs/daily-macro-log.service", () => ({
  assertNutritionistCanViewPatient: assertNutritionistCanViewPatientMock,
  getPatientProgressByDate: getPatientProgressByDateMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/daily-macro-logs/patient/[patientId]/progress/route";

describe("/api/daily-macro-logs/patient/[patientId]/progress route", () => {
  beforeEach(() => {
    assertNutritionistCanViewPatientMock.mockReset();
    getPatientProgressByDateMock.mockReset();
    requireAuthMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns patient progress for a linked patient", async () => {
    getPatientProgressByDateMock.mockResolvedValue({
      date: "2026-05-09",
      goals: {
        calories: 2000,
        protein: 140,
        carbs: 220,
        fat: 60,
      },
      consumed: {
        calories: 1200,
        protein: 80,
        carbs: 130,
        fat: 35,
      },
      remaining: {
        calories: 800,
        protein: 60,
        carbs: 90,
        fat: 25,
      },
      progress: {
        calories: 60,
        protein: 57,
        carbs: 59,
        fat: 58,
      },
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
      },
      meals: [],
      completedMealIds: [],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1/progress?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(assertNutritionistCanViewPatientMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(getPatientProgressByDateMock).toHaveBeenCalledWith(
      "patient-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });

  it("allows a patient to read their own progress", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
    getPatientProgressByDateMock.mockResolvedValue({
      date: "2026-05-09",
      goals: {
        calories: 2000,
        protein: 140,
        carbs: 220,
        fat: 60,
      },
      consumed: {
        calories: 1200,
        protein: 80,
        carbs: 130,
        fat: 35,
      },
      remaining: {
        calories: 800,
        protein: 60,
        carbs: 90,
        fat: 25,
      },
      progress: {
        calories: 60,
        protein: 57,
        carbs: 59,
        fat: 58,
      },
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
      },
      meals: [],
      completedMealIds: [],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1/progress?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(assertNutritionistCanViewPatientMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("returns 403 when a patient requests another patient's progress", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-2", role: "PATIENT" });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1/progress?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(response.status).toBe(403);
    expect(getPatientProgressByDateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the patient has no macro goal", async () => {
    getPatientProgressByDateMock.mockRejectedValue(
      new AppError("Macro goal not found.", 404),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1/progress?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(response.status).toBe(404);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  assertNutritionistCanViewPatientMock,
  getDailyMacroLogByDateMock,
  requireAuthMock,
} = vi.hoisted(() => ({
  assertNutritionistCanViewPatientMock: vi.fn(),
  getDailyMacroLogByDateMock: vi.fn(),
  requireAuthMock: vi.fn(),
}));

vi.mock("@/modules/daily-macro-logs/daily-macro-log.service", () => ({
  assertNutritionistCanViewPatient: assertNutritionistCanViewPatientMock,
  getDailyMacroLogByDate: getDailyMacroLogByDateMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/daily-macro-logs/patient/[patientId]/route";

describe("/api/daily-macro-logs/patient/[patientId] route", () => {
  beforeEach(() => {
    assertNutritionistCanViewPatientMock.mockReset();
    getDailyMacroLogByDateMock.mockReset();
    requireAuthMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a daily macro log for a linked patient", async () => {
    getDailyMacroLogByDateMock.mockResolvedValue({
      id: "log-1",
      patientId: "patient-1",
      date: "2026-05-09",
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T13:00:00.000Z",
    });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(assertNutritionistCanViewPatientMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    expect(getDailyMacroLogByDateMock).toHaveBeenCalledWith(
      "patient-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });

  it("allows a patient to read their own daily macro log", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
    getDailyMacroLogByDateMock.mockResolvedValue({
      id: "log-1",
      patientId: "patient-1",
      date: "2026-05-09",
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T13:00:00.000Z",
    });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(assertNutritionistCanViewPatientMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("returns 403 when a patient tries to read another patient's log", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-2", role: "PATIENT" });

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(response.status).toBe(403);
    expect(getDailyMacroLogByDateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid date query", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1?date=09-05-2026",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(response.status).toBe(400);
    expect(getDailyMacroLogByDateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the daily macro log does not exist", async () => {
    getDailyMacroLogByDateMock.mockRejectedValue(
      new AppError("Daily macro log not found.", 404),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/daily-macro-logs/patient/patient-1?date=2026-05-09",
      ),
      {
        params: Promise.resolve({ patientId: "patient-1" }),
      },
    );

    expect(response.status).toBe(404);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getTodayDailyMacroLogMock,
  requireAuthMock,
  requireRoleMock,
  upsertTodayDailyMacroLogMock,
} = vi.hoisted(() => ({
  getTodayDailyMacroLogMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
  upsertTodayDailyMacroLogMock: vi.fn(),
}));

vi.mock("@/modules/daily-macro-logs/daily-macro-log.service", () => ({
  getTodayDailyMacroLog: getTodayDailyMacroLogMock,
  upsertTodayDailyMacroLog: upsertTodayDailyMacroLogMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { AppError } from "@/lib/errors";
import { GET, POST } from "@/app/api/daily-macro-logs/today/route";

describe("/api/daily-macro-logs/today route", () => {
  beforeEach(() => {
    getTodayDailyMacroLogMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    upsertTodayDailyMacroLogMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("upserts today's log for the authenticated patient", async () => {
    upsertTodayDailyMacroLogMock.mockResolvedValue({
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

    const request = new Request("http://localhost/api/daily-macro-logs/today", {
      method: "POST",
      body: JSON.stringify({
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(upsertTodayDailyMacroLogMock).toHaveBeenCalledWith("patient-1", {
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
    });
    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid consumed macro payload", async () => {
    const request = new Request("http://localhost/api/daily-macro-logs/today", {
      method: "POST",
      body: JSON.stringify({
        caloriesConsumed: -1,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(upsertTodayDailyMacroLogMock).not.toHaveBeenCalled();
  });

  it("returns 403 when a nutritionist tries to write a daily log", async () => {
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
    requireRoleMock.mockImplementation(() => {
      throw new AppError("Insufficient permissions.", 403);
    });

    const request = new Request("http://localhost/api/daily-macro-logs/today", {
      method: "POST",
      body: JSON.stringify({
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(upsertTodayDailyMacroLogMock).not.toHaveBeenCalled();
  });

  it("returns today's log for the authenticated patient", async () => {
    getTodayDailyMacroLogMock.mockResolvedValue({
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
      new Request("http://localhost/api/daily-macro-logs/today"),
    );

    expect(getTodayDailyMacroLogMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });

  it("returns 404 when today's log does not exist", async () => {
    getTodayDailyMacroLogMock.mockRejectedValue(
      new AppError("Daily macro log not found.", 404),
    );

    const response = await GET(
      new Request("http://localhost/api/daily-macro-logs/today"),
    );

    expect(response.status).toBe(404);
  });
});

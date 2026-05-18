import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPatientProgressHistoryMock, requireAuthMock } = vi.hoisted(() => ({
  getPatientProgressHistoryMock: vi.fn(),
  requireAuthMock: vi.fn(),
}));

vi.mock("@/modules/daily-macro-logs/daily-macro-log.service", () => ({
  getPatientProgressHistory: getPatientProgressHistoryMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

import { GET } from "@/app/api/patient/progress-history/route";

describe("/api/patient/progress-history route", () => {
  beforeEach(() => {
    getPatientProgressHistoryMock.mockReset();
    requireAuthMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns the authenticated patient's 7-day progress history by default", async () => {
    getPatientProgressHistoryMock.mockResolvedValue({
      range: 7,
      summary: {
        averageAdherence: 82,
        daysTracked: 6,
        completedMeals: 24,
        totalMeals: 30,
      },
      history: [],
    });

    const response = await GET(
      new Request("http://localhost/api/patient/progress-history"),
    );

    expect(getPatientProgressHistoryMock).toHaveBeenCalledWith("patient-1", 7);
    expect(response.status).toBe(200);
  });

  it("returns the authenticated patient's 30-day progress history", async () => {
    getPatientProgressHistoryMock.mockResolvedValue({
      range: 30,
      summary: {
        averageAdherence: 76,
        daysTracked: 20,
        completedMeals: 60,
        totalMeals: 120,
      },
      history: [],
    });

    const response = await GET(
      new Request("http://localhost/api/patient/progress-history?range=30"),
    );

    expect(getPatientProgressHistoryMock).toHaveBeenCalledWith("patient-1", 30);
    expect(response.status).toBe(200);
  });

  it("returns the authenticated patient's 90-day progress history", async () => {
    getPatientProgressHistoryMock.mockResolvedValue({
      range: 90,
      summary: {
        averageAdherence: 74,
        daysTracked: 51,
        completedMeals: 180,
        totalMeals: 270,
      },
      history: [],
    });

    const response = await GET(
      new Request("http://localhost/api/patient/progress-history?range=90"),
    );

    expect(getPatientProgressHistoryMock).toHaveBeenCalledWith("patient-1", 90);
    expect(response.status).toBe(200);
  });

  it("blocks nutritionist access", async () => {
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });

    const response = await GET(
      new Request("http://localhost/api/patient/progress-history"),
    );

    expect(response.status).toBe(403);
    expect(getPatientProgressHistoryMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid ranges", async () => {
    const response = await GET(
      new Request("http://localhost/api/patient/progress-history?range=15"),
    );

    expect(response.status).toBe(400);
    expect(getPatientProgressHistoryMock).not.toHaveBeenCalled();
  });
});

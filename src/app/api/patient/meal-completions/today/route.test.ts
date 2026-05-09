import { beforeEach, describe, expect, it, vi } from "vitest";

const { getTodayCompletedMealsMock, requireAuthMock, requireRoleMock } =
  vi.hoisted(() => ({
    getTodayCompletedMealsMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }));

vi.mock("@/modules/meal-completions/meal-completion.service", () => ({
  getTodayCompletedMeals: getTodayCompletedMealsMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { GET } from "@/app/api/patient/meal-completions/today/route";

describe("/api/patient/meal-completions/today route", () => {
  beforeEach(() => {
    getTodayCompletedMealsMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("returns today's completed meals for the authenticated patient", async () => {
    getTodayCompletedMealsMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/patient/meal-completions/today"),
    );

    expect(getTodayCompletedMealsMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });
});

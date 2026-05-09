import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  assertNutritionistCanAccessPatientMock,
  createMacroGoalMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(
  () => ({
    assertNutritionistCanAccessPatientMock: vi.fn(),
    createMacroGoalMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }),
);

vi.mock("@/modules/macro-goals/macro-goal.service", () => ({
  createMacroGoal: createMacroGoalMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  assertNutritionistCanAccessPatient: assertNutritionistCanAccessPatientMock,
}));

import { AppError } from "@/lib/errors";
import { POST } from "@/app/api/macro-goals/route";

describe("/api/macro-goals route", () => {
  beforeEach(() => {
    assertNutritionistCanAccessPatientMock.mockReset();
    createMacroGoalMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("creates a macro goal and returns status 201", async () => {
    createMacroGoalMock.mockResolvedValue({
      id: "goal-1",
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    const request = new Request("http://localhost/api/macro-goals", {
      method: "POST",
      body: JSON.stringify({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(assertNutritionistCanAccessPatientMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
    await expect(response.json()).resolves.toMatchObject({
      id: "goal-1",
      patientId: "patient-1",
    });
  });

  it("returns status 400 for invalid macro goal payload", async () => {
    const request = new Request("http://localhost/api/macro-goals", {
      method: "POST",
      body: JSON.stringify({
        patientId: "",
        calories: -1,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createMacroGoalMock).not.toHaveBeenCalled();
  });

  it("returns status 401 when not authenticated", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const request = new Request("http://localhost/api/macro-goals", {
      method: "POST",
      body: JSON.stringify({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(createMacroGoalMock).not.toHaveBeenCalled();
  });

  it("returns status 403 when user is not a nutritionist", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
    requireRoleMock.mockImplementation(() => {
      throw new AppError("Insufficient permissions.", 403);
    });

    const request = new Request("http://localhost/api/macro-goals", {
      method: "POST",
      body: JSON.stringify({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(createMacroGoalMock).not.toHaveBeenCalled();
  });
});

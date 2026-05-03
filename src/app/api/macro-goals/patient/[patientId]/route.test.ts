import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMacroGoalByPatientIdMock, requireAuthMock } = vi.hoisted(() => ({
  getMacroGoalByPatientIdMock: vi.fn(),
  requireAuthMock: vi.fn(),
}));

vi.mock("@/modules/macro-goals/macro-goal.service", () => ({
  getMacroGoalByPatientId: getMacroGoalByPatientIdMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/macro-goals/patient/[patientId]/route";

describe("/api/macro-goals/patient/[patientId] route", () => {
  beforeEach(() => {
    getMacroGoalByPatientIdMock.mockReset();
    requireAuthMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("returns a macro goal for the patient", async () => {
    getMacroGoalByPatientIdMock.mockResolvedValue({
      id: "goal-1",
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(getMacroGoalByPatientIdMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "goal-1",
    });
  });

  it("returns 404 when the macro goal does not exist", async () => {
    getMacroGoalByPatientIdMock.mockRejectedValue(
      new AppError("Macro goal not found.", 404),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "Macro goal not found.",
    });
  });

  it("returns 401 when not authenticated", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(401);
    expect(getMacroGoalByPatientIdMock).not.toHaveBeenCalled();
  });

  it("allows a patient to view their own macro goal", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
    getMacroGoalByPatientIdMock.mockResolvedValue({
      id: "goal-1",
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(200);
  });

  it("returns 403 when a patient tries to view another patient's macro goal", async () => {
    requireAuthMock.mockResolvedValue({ userId: "patient-2", role: "PATIENT" });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ patientId: "patient-1" }),
    });

    expect(response.status).toBe(403);
    expect(getMacroGoalByPatientIdMock).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMacroGoalMock } = vi.hoisted(() => ({
  createMacroGoalMock: vi.fn(),
}));

vi.mock("@/modules/macro-goals/macro-goal.service", () => ({
  createMacroGoal: createMacroGoalMock,
}));

import { POST } from "@/app/api/macro-goals/route";

describe("/api/macro-goals route", () => {
  beforeEach(() => {
    createMacroGoalMock.mockReset();
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
});

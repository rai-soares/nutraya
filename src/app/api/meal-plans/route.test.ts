import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMealPlanMock, requireAuthMock, requireRoleMock } = vi.hoisted(
  () => ({
    createMealPlanMock: vi.fn(),
    requireAuthMock: vi.fn(),
    requireRoleMock: vi.fn(),
  }),
);

vi.mock("@/modules/meal-plans/meal-plan.service", () => ({
  createMealPlan: createMealPlanMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { AppError } from "@/lib/errors";
import { POST } from "@/app/api/meal-plans/route";

describe("/api/meal-plans route", () => {
  beforeEach(() => {
    createMealPlanMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
  });

  it("creates a meal plan", async () => {
    createMealPlanMock.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: false,
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:30:00.000Z",
    });

    const request = new Request("http://localhost/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "patient-1",
        title: "Plan A",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(createMealPlanMock).toHaveBeenCalledWith("nutri-1", {
      patientId: "patient-1",
      title: "Plan A",
      isActive: false,
    });
  });

  it("returns 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "patient-1",
        title: "",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createMealPlanMock).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    requireAuthMock.mockRejectedValue(
      new AppError("Authentication required.", 401),
    );

    const request = new Request("http://localhost/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "patient-1",
        title: "Plan A",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});

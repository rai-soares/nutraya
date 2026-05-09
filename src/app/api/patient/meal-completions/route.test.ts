import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCompletedMealsForDateMock,
  markMealAsCompletedMock,
  requireAuthMock,
  requireRoleMock,
  unmarkMealAsCompletedMock,
} = vi.hoisted(() => ({
  getCompletedMealsForDateMock: vi.fn(),
  markMealAsCompletedMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
  unmarkMealAsCompletedMock: vi.fn(),
}));

vi.mock("@/modules/meal-completions/meal-completion.service", () => ({
  getCompletedMealsForDate: getCompletedMealsForDateMock,
  markMealAsCompleted: markMealAsCompletedMock,
  unmarkMealAsCompleted: unmarkMealAsCompletedMock,
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

import { AppError } from "@/lib/errors";
import { DELETE, GET, POST } from "@/app/api/patient/meal-completions/route";

describe("/api/patient/meal-completions route", () => {
  beforeEach(() => {
    getCompletedMealsForDateMock.mockReset();
    markMealAsCompletedMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    unmarkMealAsCompletedMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("marks a meal as completed for the authenticated patient", async () => {
    markMealAsCompletedMock.mockResolvedValue({
      id: "completion-1",
      patientId: "patient-1",
      mealId: "meal-1",
      date: "2026-05-09",
      completedAt: "2026-05-09T12:00:00.000Z",
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost/api/patient/meal-completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealId: "meal-1",
          date: "2026-05-09",
        }),
      }),
    );

    expect(markMealAsCompletedMock).toHaveBeenCalledWith(
      "patient-1",
      "meal-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });

  it("unmarks a completed meal for the authenticated patient", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/patient/meal-completions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealId: "meal-1",
          date: "2026-05-09",
        }),
      }),
    );

    expect(unmarkMealAsCompletedMock).toHaveBeenCalledWith(
      "patient-1",
      "meal-1",
      "2026-05-09",
    );
    expect(response.status).toBe(204);
  });

  it("lists completed meals for a date", async () => {
    getCompletedMealsForDateMock.mockResolvedValue([]);

    const response = await GET(
      new Request(
        "http://localhost/api/patient/meal-completions?date=2026-05-09",
      ),
    );

    expect(getCompletedMealsForDateMock).toHaveBeenCalledWith(
      "patient-1",
      "2026-05-09",
    );
    expect(response.status).toBe(200);
  });

  it("returns 403 when a nutritionist tries to mark a meal", async () => {
    requireAuthMock.mockResolvedValue({ userId: "nutri-1", role: "NUTRI" });
    requireRoleMock.mockImplementation(() => {
      throw new AppError("Insufficient permissions.", 403);
    });

    const response = await POST(
      new Request("http://localhost/api/patient/meal-completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealId: "meal-1",
          date: "2026-05-09",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(markMealAsCompletedMock).not.toHaveBeenCalled();
  });
});

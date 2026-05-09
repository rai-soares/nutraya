import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createMealSubstitutionMock,
  listPatientMealSubstitutionsMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  createMealSubstitutionMock: vi.fn(),
  listPatientMealSubstitutionsMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution.service", () => ({
  createMealSubstitution: createMealSubstitutionMock,
  listPatientMealSubstitutions: listPatientMealSubstitutionsMock,
}));

import { GET, POST } from "@/app/api/patient/meal-substitutions/route";

describe("/api/patient/meal-substitutions route", () => {
  beforeEach(() => {
    createMealSubstitutionMock.mockReset();
    listPatientMealSubstitutionsMock.mockReset();
    requireAuthMock.mockReset();
    requireRoleMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("lists the authenticated patient's substitution requests", async () => {
    listPatientMealSubstitutionsMock.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/patient/meal-substitutions"),
    );

    expect(listPatientMealSubstitutionsMock).toHaveBeenCalledWith("patient-1");
    expect(response.status).toBe(200);
  });

  it("creates a substitution request", async () => {
    createMealSubstitutionMock.mockResolvedValue({ id: "sub-1" });

    const response = await POST(
      new Request("http://localhost/api/patient/meal-substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId: "meal-1",
          imageUrl: "https://cdn.example.com/meal.jpg",
          note: "Can I switch this?",
        }),
      }),
    );

    expect(createMealSubstitutionMock).toHaveBeenCalledWith("patient-1", {
      mealId: "meal-1",
      imageUrl: "https://cdn.example.com/meal.jpg",
      note: "Can I switch this?",
    });
    expect(response.status).toBe(201);
  });

  it("returns 400 for an invalid create payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/patient/meal-substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId: "",
          imageUrl: "bad-url",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(createMealSubstitutionMock).not.toHaveBeenCalled();
  });
});

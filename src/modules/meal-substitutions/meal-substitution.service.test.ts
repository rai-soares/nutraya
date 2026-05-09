import { MealSubstitutionStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

const { assertNutritionistCanAccessPatientMock } = vi.hoisted(() => ({
  assertNutritionistCanAccessPatientMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  assertNutritionistCanAccessPatient: assertNutritionistCanAccessPatientMock,
}));

import {
  approveMealSubstitution,
  createMealSubstitution,
  getNutritionistMealSubstitutionById,
  getPatientMealSubstitutionById,
  listNutritionistMealSubstitutions,
  listPatientMealSubstitutions,
  rejectMealSubstitution,
} from "@/modules/meal-substitutions/meal-substitution.service";

const createdAt = new Date("2026-05-09T12:00:00.000Z");
const updatedAt = new Date("2026-05-09T12:30:00.000Z");

function buildSubstitutionRecord(status = MealSubstitutionStatus.PENDING) {
  return {
    id: "sub-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    mealId: "meal-1",
    imageUrl: "https://cdn.example.com/meal.jpg",
    note: "Can I swap this?",
    status,
    nutritionistFeedback: null,
    reviewedAt: null,
    createdAt,
    updatedAt,
    patient: {
      id: "patient-1",
      name: "Pat One",
    },
    nutritionist: {
      id: "nutri-1",
      name: "Nutri One",
    },
    meal: {
      id: "meal-1",
      name: "Lunch",
      mealPlanId: "plan-1",
    },
  };
}

describe("meal substitution service", () => {
  beforeEach(() => {
    resetPrismaMock();
    assertNutritionistCanAccessPatientMock.mockReset();
  });

  it("creates a substitution request for a meal in the patient's active plan", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      name: "Lunch",
      mealPlanId: "plan-1",
      mealPlan: {
        patientId: "patient-1",
        nutritionistId: "nutri-1",
        isActive: true,
      },
    });
    prismaMock.mealSubstitution.create.mockResolvedValue(buildSubstitutionRecord());

    const result = await createMealSubstitution("patient-1", {
      mealId: "meal-1",
      imageUrl: "https://cdn.example.com/meal.jpg",
      note: "Can I swap this?",
    });

    expect(prismaMock.mealSubstitution.create).toHaveBeenCalledWith({
      data: {
        patientId: "patient-1",
        nutritionistId: "nutri-1",
        mealId: "meal-1",
        imageUrl: "https://cdn.example.com/meal.jpg",
        note: "Can I swap this?",
        status: MealSubstitutionStatus.PENDING,
      },
      select: expect.any(Object),
    });
    expect(result.status).toBe("PENDING");
  });

  it("rejects substitutions for meals outside the patient's active plan", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      name: "Lunch",
      mealPlanId: "plan-1",
      mealPlan: {
        patientId: "patient-2",
        nutritionistId: "nutri-1",
        isActive: true,
      },
    });

    await expect(
      createMealSubstitution("patient-1", {
        mealId: "meal-1",
        imageUrl: "https://cdn.example.com/meal.jpg",
      }),
    ).rejects.toMatchObject({
      message: "Meal does not belong to the patient's active meal plan.",
      statusCode: 400,
    });
  });

  it("lists substitution requests for a patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.mealSubstitution.findMany.mockResolvedValue([
      buildSubstitutionRecord(),
    ]);

    const result = await listPatientMealSubstitutions("patient-1");

    expect(result).toHaveLength(1);
    expect(prismaMock.mealSubstitution.findMany).toHaveBeenCalledWith({
      where: { patientId: "patient-1" },
      orderBy: [{ createdAt: "desc" }],
      select: expect.any(Object),
    });
  });

  it("prevents a patient from reading another patient's request", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue(
      buildSubstitutionRecord(),
    );

    await expect(
      getPatientMealSubstitutionById("patient-2", "sub-1"),
    ).rejects.toMatchObject({
      message: "Meal substitution request not found.",
      statusCode: 404,
    });
  });

  it("lists nutritionist requests filtered by patient when provided", async () => {
    assertNutritionistCanAccessPatientMock.mockResolvedValue(undefined);
    prismaMock.mealSubstitution.findMany.mockResolvedValue([
      buildSubstitutionRecord(),
    ]);

    const result = await listNutritionistMealSubstitutions("nutri-1", "patient-1");

    expect(result).toHaveLength(1);
    expect(assertNutritionistCanAccessPatientMock).toHaveBeenCalledWith(
      "nutri-1",
      "patient-1",
    );
  });

  it("prevents a nutritionist from reading an unlinked request", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue({
      ...buildSubstitutionRecord(),
      nutritionistId: "nutri-2",
    });

    await expect(
      getNutritionistMealSubstitutionById("nutri-1", "sub-1"),
    ).rejects.toMatchObject({
      message: "Meal substitution request not found.",
      statusCode: 404,
    });
  });

  it("approves a pending substitution and sets reviewed data", async () => {
    assertNutritionistCanAccessPatientMock.mockResolvedValue(undefined);
    prismaMock.mealSubstitution.findUnique.mockResolvedValue(
      buildSubstitutionRecord(),
    );
    prismaMock.mealSubstitution.update.mockResolvedValue({
      ...buildSubstitutionRecord(MealSubstitutionStatus.APPROVED),
      nutritionistFeedback: "Approved for today.",
      reviewedAt: updatedAt,
    });

    const result = await approveMealSubstitution("nutri-1", "sub-1", {
      nutritionistFeedback: "Approved for today.",
    });

    expect(prismaMock.mealSubstitution.update).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: {
        status: MealSubstitutionStatus.APPROVED,
        nutritionistFeedback: "Approved for today.",
        reviewedAt: expect.any(Date),
      },
      select: expect.any(Object),
    });
    expect(result.status).toBe("APPROVED");
    expect(result.reviewedAt).toBe(updatedAt.toISOString());
  });

  it("rejects an already reviewed substitution", async () => {
    assertNutritionistCanAccessPatientMock.mockResolvedValue(undefined);
    prismaMock.mealSubstitution.findUnique.mockResolvedValue(
      buildSubstitutionRecord(MealSubstitutionStatus.APPROVED),
    );

    await expect(
      rejectMealSubstitution("nutri-1", "sub-1", {
        nutritionistFeedback: "No need.",
      }),
    ).rejects.toMatchObject({
      message: "Meal substitution request has already been reviewed.",
      statusCode: 409,
    });
  });
});

import { MealSubstitutionStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

const {
  assertNutritionistCanAccessPatientMock,
  estimateMealPhotoMacrosMock,
} = vi.hoisted(() => ({
  assertNutritionistCanAccessPatientMock: vi.fn(),
  estimateMealPhotoMacrosMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/modules/patient-profile/patient-profile.service", () => ({
  assertNutritionistCanAccessPatient: assertNutritionistCanAccessPatientMock,
}));

vi.mock("@/modules/meal-substitutions/meal-substitution-estimation.service", () => ({
  estimateMealPhotoMacros: estimateMealPhotoMacrosMock,
}));

import {
  createMealSubstitution,
  estimateNutritionistMealSubstitutionMacros,
  estimatePatientMealSubstitutionMacros,
  getNutritionistMealSubstitutionById,
  getPatientMealSubstitutionById,
  listNutritionistMealSubstitutions,
  listPatientMealSubstitutions,
  saveNutritionistMealSubstitutionFeedback,
} from "@/modules/meal-substitutions/meal-substitution.service";

const createdAt = new Date("2026-05-09T12:00:00.000Z");
const updatedAt = new Date("2026-05-09T12:30:00.000Z");

function buildSubstitutionRecord(
  status: MealSubstitutionStatus = MealSubstitutionStatus.PENDING,
) {
  return {
    id: "sub-1",
    patientId: "patient-1",
    nutritionistId: "nutri-1",
    mealId: "meal-1",
    imageUrl: "https://cdn.example.com/meal.jpg",
    note: "Can I swap this?",
    status,
    nutritionistFeedback: null,
    estimatedCalories: null,
    estimatedProtein: null,
    estimatedCarbs: null,
    estimatedFat: null,
    estimatedFoods: null,
    portionEstimate: null,
    confidence: null,
    aiNotes: null,
    estimatedAt: null,
    reviewedAt: null,
    appliedToDailyLog: false,
    appliedAt: null,
    appliedByUserId: null,
    appliedDailyLogId: null,
    applicationDate: null,
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
    estimateMealPhotoMacrosMock.mockReset();
  });

  it("creates a substitution, estimates macros, and applies them immediately", async () => {
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
    estimateMealPhotoMacrosMock.mockResolvedValue({
      identifiedFoods: ["rice", "grilled chicken", "salad"],
      portionEstimate: "One medium plate",
      calories: 620,
      protein: 42,
      carbs: 68,
      fat: 18,
      confidence: "MEDIUM",
      notes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
    });
    prismaMock.mealSubstitution.update.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      estimatedFoods: ["rice", "grilled chicken", "salad"],
      portionEstimate: "One medium plate",
      confidence: "MEDIUM",
      aiNotes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
      estimatedAt: updatedAt,
    });
    prismaMock.mealSubstitution.findUnique
      .mockResolvedValueOnce({
        ...buildSubstitutionRecord(),
        estimatedCalories: 620,
        estimatedProtein: 42,
        estimatedCarbs: 68,
        estimatedFat: 18,
        estimatedFoods: ["rice", "grilled chicken", "salad"],
        portionEstimate: "One medium plate",
        confidence: "MEDIUM",
        aiNotes:
          "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
        estimatedAt: updatedAt,
      })
      .mockResolvedValueOnce({
        ...buildSubstitutionRecord(),
        estimatedCalories: 620,
        estimatedProtein: 42,
        estimatedCarbs: 68,
        estimatedFat: 18,
        estimatedFoods: ["rice", "grilled chicken", "salad"],
        portionEstimate: "One medium plate",
        confidence: "MEDIUM",
        aiNotes:
          "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
        estimatedAt: updatedAt,
        appliedToDailyLog: true,
        appliedAt: new Date("2026-05-09T12:00:00.000Z"),
        appliedByUserId: "patient-1",
        appliedDailyLogId: "log-1",
        applicationDate: new Date("2026-05-09T00:00:00.000Z"),
      });
    prismaMock.dailyMacroLog.upsert.mockResolvedValue({
      id: "log-1",
    });
    prismaMock.mealSubstitution.updateMany.mockResolvedValue({
      count: 1,
    });
    prismaMock.dailyMacroLog.update.mockResolvedValue({
      id: "log-1",
      date: new Date("2026-05-09T00:00:00.000Z"),
      caloriesConsumed: 620,
      proteinConsumed: 42,
      carbsConsumed: 68,
      fatConsumed: 18,
    });

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
    expect(estimateMealPhotoMacrosMock).toHaveBeenCalledWith(
      "https://cdn.example.com/meal.jpg",
    );
    expect(prismaMock.mealSubstitution.update).toHaveBeenCalled();
    expect(prismaMock.dailyMacroLog.upsert).toHaveBeenCalled();
    expect(prismaMock.mealSubstitution.updateMany).toHaveBeenCalledWith({
      where: {
        id: "sub-1",
        patientId: "patient-1",
        appliedToDailyLog: false,
        estimatedCalories: { not: null },
        estimatedProtein: { not: null },
        estimatedCarbs: { not: null },
        estimatedFat: { not: null },
      },
      data: {
        appliedToDailyLog: true,
        appliedAt: expect.any(Date),
        appliedByUserId: "patient-1",
        appliedDailyLogId: "log-1",
        applicationDate: expect.any(Date),
      },
    });
    expect(prismaMock.dailyMacroLog.update).toHaveBeenCalled();
    expect(result.appliedToDailyLog).toBe(true);
    expect(result.estimatedCalories).toBe(620);
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

  it("saves nutritionist feedback after the substitution was applied", async () => {
    assertNutritionistCanAccessPatientMock.mockResolvedValue(undefined);
    prismaMock.mealSubstitution.findUnique.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      appliedToDailyLog: true,
      applicationDate: new Date("2026-05-09T00:00:00.000Z"),
    });
    prismaMock.mealSubstitution.update.mockResolvedValue({
      ...buildSubstitutionRecord(),
      nutritionistFeedback: "Keep the same protein source next time.",
      reviewedAt: updatedAt,
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      appliedToDailyLog: true,
      applicationDate: new Date("2026-05-09T00:00:00.000Z"),
    });

    const result = await saveNutritionistMealSubstitutionFeedback("nutri-1", "sub-1", {
      nutritionistFeedback: "Keep the same protein source next time.",
    });

    expect(prismaMock.mealSubstitution.update).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: {
        nutritionistFeedback: "Keep the same protein source next time.",
        reviewedAt: expect.any(Date),
      },
      select: expect.any(Object),
    });
    expect(result.nutritionistFeedback).toBe(
      "Keep the same protein source next time.",
    );
  });

  it("returns an existing estimation without re-running AI when force is not set", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      estimatedFoods: ["rice", "grilled chicken", "salad"],
      portionEstimate: "One medium plate",
      confidence: "MEDIUM",
      aiNotes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
      estimatedAt: updatedAt,
    });

    const result = await estimatePatientMealSubstitutionMacros("patient-1", "sub-1");

    expect(estimateMealPhotoMacrosMock).not.toHaveBeenCalled();
    expect(result.estimatedMacros.calories).toBe(620);
    expect(result.confidence).toBe("MEDIUM");
  });

  it("runs estimation and saves the result when no prior estimate exists", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue(buildSubstitutionRecord());
    estimateMealPhotoMacrosMock.mockResolvedValue({
      identifiedFoods: ["rice", "grilled chicken", "salad"],
      portionEstimate: "One medium plate",
      calories: 620,
      protein: 42,
      carbs: 68,
      fat: 18,
      confidence: "MEDIUM",
      notes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
    });
    prismaMock.mealSubstitution.update.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 620,
      estimatedProtein: 42,
      estimatedCarbs: 68,
      estimatedFat: 18,
      estimatedFoods: ["rice", "grilled chicken", "salad"],
      portionEstimate: "One medium plate",
      confidence: "MEDIUM",
      aiNotes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
      estimatedAt: updatedAt,
    });

    const result = await estimatePatientMealSubstitutionMacros("patient-1", "sub-1");

    expect(estimateMealPhotoMacrosMock).toHaveBeenCalledWith(
      "https://cdn.example.com/meal.jpg",
    );
    expect(prismaMock.mealSubstitution.update).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: {
        estimatedCalories: 620,
        estimatedProtein: 42,
        estimatedCarbs: 68,
        estimatedFat: 18,
        estimatedFoods: ["rice", "grilled chicken", "salad"],
        portionEstimate: "One medium plate",
        confidence: "MEDIUM",
        aiNotes:
          "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
        estimatedAt: expect.any(Date),
      },
      select: expect.any(Object),
    });
    expect(result.identifiedFoods).toEqual(["rice", "grilled chicken", "salad"]);
  });

  it("re-runs estimation when force is true", async () => {
    assertNutritionistCanAccessPatientMock.mockResolvedValue(undefined);
    prismaMock.mealSubstitution.findUnique.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 500,
      estimatedProtein: 30,
      estimatedCarbs: 55,
      estimatedFat: 15,
      estimatedFoods: ["old result"],
      portionEstimate: "Old estimate",
      confidence: "LOW",
      aiNotes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
      estimatedAt: createdAt,
    });
    estimateMealPhotoMacrosMock.mockResolvedValue({
      identifiedFoods: ["rice", "chicken"],
      portionEstimate: "Updated plate",
      calories: 610,
      protein: 40,
      carbs: 65,
      fat: 20,
      confidence: "MEDIUM",
      notes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
    });
    prismaMock.mealSubstitution.update.mockResolvedValue({
      ...buildSubstitutionRecord(),
      estimatedCalories: 610,
      estimatedProtein: 40,
      estimatedCarbs: 65,
      estimatedFat: 20,
      estimatedFoods: ["rice", "chicken"],
      portionEstimate: "Updated plate",
      confidence: "MEDIUM",
      aiNotes:
        "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
      estimatedAt: updatedAt,
    });

    const result = await estimateNutritionistMealSubstitutionMacros("nutri-1", "sub-1", {
      force: true,
    });

    expect(estimateMealPhotoMacrosMock).toHaveBeenCalledTimes(1);
    expect(result.portionEstimate).toBe("Updated plate");
  });

  it("returns a controlled error when the image url is invalid", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue({
      ...buildSubstitutionRecord(),
      imageUrl: "not-a-url",
    });

    await expect(
      estimatePatientMealSubstitutionMacros("patient-1", "sub-1"),
    ).rejects.toMatchObject({
      message: "Meal image URL is invalid.",
      statusCode: 400,
    });
  });

  it("rolls back the substitution when automatic estimation fails during submit", async () => {
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
    prismaMock.mealSubstitution.delete.mockResolvedValue(buildSubstitutionRecord());
    estimateMealPhotoMacrosMock.mockRejectedValue({
      name: "AbortError",
    });

    await expect(
      createMealSubstitution("patient-1", {
        mealId: "meal-1",
        imageUrl: "https://cdn.example.com/meal.jpg",
      }),
    ).rejects.toMatchObject({
      message: "Unable to estimate meal macros right now.",
      statusCode: 502,
    });
    expect(prismaMock.mealSubstitution.delete).toHaveBeenCalledWith({
      where: { id: "sub-1" },
    });
  });

  it("returns a controlled error when AI returns invalid data", async () => {
    prismaMock.mealSubstitution.findUnique.mockResolvedValue(buildSubstitutionRecord());
    estimateMealPhotoMacrosMock.mockRejectedValue(new SyntaxError("bad json"));

    await expect(
      estimatePatientMealSubstitutionMacros("patient-1", "sub-1"),
    ).rejects.toMatchObject({
      message: "AI estimation returned an invalid result.",
      statusCode: 502,
    });
  });
});

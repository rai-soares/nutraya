import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getCompletedMealsForDate,
  getCompletedMealsForLinkedPatientByDate,
  getPatientMealCompletionSummaryByDate,
  getTodayCompletedMeals,
  markMealAsCompleted,
  unmarkMealAsCompleted,
} from "@/modules/meal-completions/meal-completion.service";

const createdAt = new Date("2026-05-09T12:00:00.000Z");
const updatedAt = new Date("2026-05-09T12:30:00.000Z");

describe("meal completion service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("marks a meal as completed and adds its macros to the daily log", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      calories: 600,
      protein: 40,
      carbs: 70,
      fat: 15,
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
        patientId: "patient-1",
        isActive: true,
      },
    });
    prismaMock.mealCompletion.createMany.mockResolvedValue({
      count: 1,
    });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue({
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
    });
    prismaMock.mealCompletion.findUnique.mockResolvedValue({
      id: "completion-1",
      patientId: "patient-1",
      mealId: "meal-1",
      date: new Date("2026-05-09T00:00:00.000Z"),
      completedAt: new Date("2026-05-09T12:45:00.000Z"),
      createdAt,
      updatedAt,
    });

    const result = await markMealAsCompleted(
      "patient-1",
      "meal-1",
      "2026-05-09",
      new Date("2026-05-09T12:45:00.000Z"),
    );

    expect(prismaMock.mealCompletion.createMany).toHaveBeenCalledWith({
      data: [
        {
          patientId: "patient-1",
          mealId: "meal-1",
          date: new Date("2026-05-09T00:00:00.000Z"),
          completedAt: new Date("2026-05-09T12:45:00.000Z"),
        },
      ],
      skipDuplicates: true,
    });
    expect(prismaMock.dailyMacroLog.upsert).toHaveBeenCalledWith({
      where: {
        patientId_date: {
          patientId: "patient-1",
          date: new Date("2026-05-09T00:00:00.000Z"),
        },
      },
      update: {
        caloriesConsumed: 1800,
        proteinConsumed: 120,
        carbsConsumed: 200,
        fatConsumed: 50,
      },
      create: {
        patientId: "patient-1",
        date: new Date("2026-05-09T00:00:00.000Z"),
        caloriesConsumed: 600,
        proteinConsumed: 40,
        carbsConsumed: 70,
        fatConsumed: 15,
      },
    });
    expect(result.mealId).toBe("meal-1");
  });

  it("does not duplicate macros when the same meal is completed twice", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      calories: 600,
      protein: 40,
      carbs: 70,
      fat: 15,
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
        patientId: "patient-1",
        isActive: true,
      },
    });
    prismaMock.mealCompletion.createMany.mockResolvedValue({
      count: 0,
    });
    prismaMock.mealCompletion.findUnique.mockResolvedValue({
      id: "completion-1",
      patientId: "patient-1",
      mealId: "meal-1",
      date: new Date("2026-05-09T00:00:00.000Z"),
      completedAt: new Date("2026-05-09T12:45:00.000Z"),
      createdAt,
      updatedAt,
    });

    await markMealAsCompleted("patient-1", "meal-1", "2026-05-09");

    expect(prismaMock.dailyMacroLog.upsert).not.toHaveBeenCalled();
  });

  it("unmarks a meal and subtracts macros without going below zero", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      calories: 600,
      protein: 40,
      carbs: 70,
      fat: 15,
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
        patientId: "patient-1",
        isActive: true,
      },
    });
    prismaMock.mealCompletion.findUnique
      .mockResolvedValueOnce({
        id: "completion-1",
      })
      .mockResolvedValueOnce({
        id: "completion-1",
      });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue({
      id: "log-1",
      caloriesConsumed: 300,
      proteinConsumed: 10,
      carbsConsumed: 20,
      fatConsumed: 5,
    });

    await unmarkMealAsCompleted("patient-1", "meal-1", "2026-05-09");

    expect(prismaMock.mealCompletion.delete).toHaveBeenCalledWith({
      where: { id: "completion-1" },
    });
    expect(prismaMock.dailyMacroLog.update).toHaveBeenCalledWith({
      where: { id: "log-1" },
      data: {
        caloriesConsumed: 0,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatConsumed: 0,
      },
    });
  });

  it("safely ignores unmarking a meal that is not completed", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      calories: 600,
      protein: 40,
      carbs: 70,
      fat: 15,
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
        patientId: "patient-1",
        isActive: true,
      },
    });
    prismaMock.mealCompletion.findUnique.mockResolvedValue(null);

    await expect(
      unmarkMealAsCompleted("patient-1", "meal-1", "2026-05-09"),
    ).resolves.toBeUndefined();

    expect(prismaMock.mealCompletion.delete).not.toHaveBeenCalled();
    expect(prismaMock.dailyMacroLog.update).not.toHaveBeenCalled();
  });

  it("rejects completing a meal outside the patient's active meal plan", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      calories: 600,
      protein: 40,
      carbs: 70,
      fat: 15,
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
        patientId: "patient-2",
        isActive: true,
      },
    });

    await expect(
      markMealAsCompleted("patient-1", "meal-1", "2026-05-09"),
    ).rejects.toMatchObject({
      message: "Meal does not belong to the patient's active meal plan.",
      statusCode: 400,
    });
  });

  it("lists completed meals for a patient and date", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([
      {
        id: "completion-1",
        patientId: "patient-1",
        mealId: "meal-1",
        date: new Date("2026-05-09T00:00:00.000Z"),
        completedAt: new Date("2026-05-09T12:45:00.000Z"),
        createdAt,
        updatedAt,
      },
    ]);

    const result = await getCompletedMealsForDate("patient-1", "2026-05-09");

    expect(result).toHaveLength(1);
    expect(result[0]?.date).toBe("2026-05-09");
  });

  it("lists today's completed meals", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    await getTodayCompletedMeals(
      "patient-1",
      new Date("2026-05-09T08:00:00.000Z"),
    );

    expect(prismaMock.mealCompletion.findMany).toHaveBeenCalledWith({
      where: {
        patientId: "patient-1",
        date: new Date("2026-05-09T00:00:00.000Z"),
      },
      orderBy: {
        completedAt: "asc",
      },
      select: {
        id: true,
        patientId: true,
        mealId: true,
        date: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("returns linked patient completions for a nutritionist", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    await getCompletedMealsForLinkedPatientByDate(
      "nutri-1",
      "patient-1",
      "2026-05-09",
    );

    expect(prismaMock.patientProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "patient-1" },
      select: { nutritionistId: true },
    });
  });

  it("returns a meal completion summary for a linked patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      title: "Default plan",
      meals: [{ id: "meal-1" }, { id: "meal-2" }, { id: "meal-3" }],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([
      { mealId: "meal-1" },
      { mealId: "meal-2" },
    ]);

    const result = await getPatientMealCompletionSummaryByDate(
      "nutri-1",
      "patient-1",
      "2026-05-09",
    );

    expect(result).toEqual({
      date: "2026-05-09",
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
      },
      totalMeals: 3,
      completedMeals: 2,
      pendingMeals: 1,
      completedMealIds: ["meal-1", "meal-2"],
    });
  });
});

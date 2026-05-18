import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  assertNutritionistCanViewPatient,
  getPatientProgressHistory,
  getPatientProgressByDate,
  getTodayDateOnly,
  getTodayDailyMacroLog,
  parseDateOnly,
  upsertTodayDailyMacroLog,
} from "@/modules/daily-macro-logs/daily-macro-log.service";

describe("daily macro log service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("parses valid date-only values", () => {
    expect(parseDateOnly("2026-05-09").toISOString()).toBe(
      "2026-05-09T00:00:00.000Z",
    );
  });

  it("rejects invalid date-only values", () => {
    try {
      parseDateOnly("2026-02-30");
      throw new Error("Expected parseDateOnly to throw.");
    } catch (error) {
      expect(error).toMatchObject({
        message: "Invalid date.",
        statusCode: 400,
      });
    }
  });

  it("formats today as a stable date-only string", () => {
    expect(getTodayDateOnly(new Date("2026-05-09T16:30:00.000Z"))).toBe(
      "2026-05-09",
    );
  });

  it("upserts today's log for an existing patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.dailyMacroLog.upsert.mockResolvedValue({
      id: "log-1",
      patientId: "patient-1",
      date: new Date("2026-05-09T00:00:00.000Z"),
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
      createdAt: new Date("2026-05-09T12:00:00.000Z"),
      updatedAt: new Date("2026-05-09T13:00:00.000Z"),
    });

    const result = await upsertTodayDailyMacroLog(
      "patient-1",
      {
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      },
      new Date("2026-05-09T16:30:00.000Z"),
    );

    expect(prismaMock.dailyMacroLog.upsert).toHaveBeenCalledWith({
      where: {
        patientId_date: {
          patientId: "patient-1",
          date: new Date("2026-05-09T00:00:00.000Z"),
        },
      },
      update: {
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      },
      create: {
        patientId: "patient-1",
        date: new Date("2026-05-09T00:00:00.000Z"),
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      },
      select: {
        id: true,
        patientId: true,
        date: true,
        caloriesConsumed: true,
        proteinConsumed: true,
        carbsConsumed: true,
        fatConsumed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(result).toMatchObject({
      id: "log-1",
      patientId: "patient-1",
      date: "2026-05-09",
    });
  });

  it("fails to upsert when the patient does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      upsertTodayDailyMacroLog("patient-1", {
        caloriesConsumed: 1200,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      }),
    ).rejects.toMatchObject({
      message: "Patient not found.",
      statusCode: 404,
    });
  });

  it("returns today's log for a patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue({
      id: "log-1",
      patientId: "patient-1",
      date: new Date("2026-05-09T00:00:00.000Z"),
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
      createdAt: new Date("2026-05-09T12:00:00.000Z"),
      updatedAt: new Date("2026-05-09T13:00:00.000Z"),
    });

    const result = await getTodayDailyMacroLog(
      "patient-1",
      new Date("2026-05-09T08:00:00.000Z"),
    );

    expect(prismaMock.dailyMacroLog.findUnique).toHaveBeenCalledWith({
      where: {
        patientId_date: {
          patientId: "patient-1",
          date: new Date("2026-05-09T00:00:00.000Z"),
        },
      },
      select: {
        id: true,
        patientId: true,
        date: true,
        caloriesConsumed: true,
        proteinConsumed: true,
        carbsConsumed: true,
        fatConsumed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(result.date).toBe("2026-05-09");
  });

  it("builds progress from goals and consumed totals", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 140,
      carbs: 220,
      fat: 60,
    });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue({
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
    });
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      title: "Default plan",
      meals: [
        {
          id: "meal-1",
          name: "Lunch",
          description: "Chicken, rice and salad",
          scheduledTime: "12:00",
          order: 2,
          calories: 600,
          protein: 40,
          carbs: 70,
          fat: 15,
        },
      ],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([{ mealId: "meal-1" }]);

    const result = await getPatientProgressByDate("patient-1", "2026-05-09");

    expect(result).toEqual({
      date: "2026-05-09",
      goals: {
        calories: 2000,
        protein: 140,
        carbs: 220,
        fat: 60,
      },
      consumed: {
        calories: 1200,
        protein: 80,
        carbs: 130,
        fat: 35,
      },
      remaining: {
        calories: 800,
        protein: 60,
        carbs: 90,
        fat: 25,
      },
      progress: {
        calories: 60,
        protein: 57,
        carbs: 59,
        fat: 58,
      },
      mealPlan: {
        id: "plan-1",
        title: "Default plan",
      },
      meals: [
        {
          id: "meal-1",
          name: "Lunch",
          description: "Chicken, rice and salad",
          scheduledTime: "12:00",
          order: 2,
          calories: 600,
          protein: 40,
          carbs: 70,
          fat: 15,
          completed: true,
        },
      ],
      completedMealIds: ["meal-1"],
    });
  });

  it("returns zero consumed macros when a daily log does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 140,
      carbs: 220,
      fat: 60,
    });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue(null);
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      title: "Default plan",
      meals: [],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    const result = await getPatientProgressByDate("patient-1", "2026-05-09");

    expect(result.consumed).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it("aggregates patient progress history by day", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 160,
      carbs: 220,
      fat: 70,
    });
    prismaMock.dailyMacroLog.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-15T00:00:00.000Z"),
        caloriesConsumed: 1800,
        proteinConsumed: 150,
        carbsConsumed: 200,
        fatConsumed: 60,
      },
      {
        date: new Date("2026-05-17T00:00:00.000Z"),
        caloriesConsumed: 2200,
        proteinConsumed: 180,
        carbsConsumed: 240,
        fatConsumed: 90,
      },
    ]);
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      meals: [{ id: "meal-1" }, { id: "meal-2" }, { id: "meal-3" }],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-15T00:00:00.000Z"),
        mealId: "meal-1",
      },
      {
        date: new Date("2026-05-15T00:00:00.000Z"),
        mealId: "meal-2",
      },
      {
        date: new Date("2026-05-17T00:00:00.000Z"),
        mealId: "meal-1",
      },
      {
        date: new Date("2026-05-17T00:00:00.000Z"),
        mealId: "meal-2",
      },
      {
        date: new Date("2026-05-17T00:00:00.000Z"),
        mealId: "meal-3",
      },
    ]);

    const result = await getPatientProgressHistory(
      "patient-1",
      7,
      new Date("2026-05-17T12:00:00.000Z"),
    );

    expect(prismaMock.dailyMacroLog.findMany).toHaveBeenCalledWith({
      where: {
        patientId: "patient-1",
        date: {
          gte: new Date("2026-05-11T00:00:00.000Z"),
          lte: new Date("2026-05-17T00:00:00.000Z"),
        },
      },
      select: {
        date: true,
        caloriesConsumed: true,
        proteinConsumed: true,
        carbsConsumed: true,
        fatConsumed: true,
      },
      orderBy: {
        date: "asc",
      },
    });
    expect(result.summary).toEqual({
      averageAdherence: 89,
      daysTracked: 2,
      completedMeals: 5,
      totalMeals: 21,
    });
    expect(result.history).toHaveLength(7);
    expect(result.history[4]).toEqual({
      date: "2026-05-15",
      calories: {
        consumed: 1800,
        goal: 2000,
      },
      protein: {
        consumed: 150,
        goal: 160,
      },
      carbs: {
        consumed: 200,
        goal: 220,
      },
      fat: {
        consumed: 60,
        goal: 70,
      },
      completedMeals: 2,
      totalMeals: 3,
      adherencePercentage: 78,
    });
    expect(result.history[6]).toEqual({
      date: "2026-05-17",
      calories: {
        consumed: 2200,
        goal: 2000,
      },
      protein: {
        consumed: 180,
        goal: 160,
      },
      carbs: {
        consumed: 240,
        goal: 220,
      },
      fat: {
        consumed: 90,
        goal: 70,
      },
      completedMeals: 3,
      totalMeals: 3,
      adherencePercentage: 100,
    });
  });

  it("returns empty tracked history when the patient has no entries yet", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 160,
      carbs: 220,
      fat: 70,
    });
    prismaMock.dailyMacroLog.findMany.mockResolvedValue([]);
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      meals: [{ id: "meal-1" }, { id: "meal-2" }],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    const result = await getPatientProgressHistory(
      "patient-1",
      7,
      new Date("2026-05-17T12:00:00.000Z"),
    );

    expect(result.summary).toEqual({
      averageAdherence: 0,
      daysTracked: 0,
      completedMeals: 0,
      totalMeals: 14,
    });
    expect(result.history[0]).toEqual({
      date: "2026-05-11",
      calories: {
        consumed: 0,
        goal: 2000,
      },
      protein: {
        consumed: 0,
        goal: 160,
      },
      carbs: {
        consumed: 0,
        goal: 220,
      },
      fat: {
        consumed: 0,
        goal: 70,
      },
      completedMeals: 0,
      totalMeals: 2,
      adherencePercentage: 0,
    });
  });

  it("fails progress calculation when the macro goal does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue(null);
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue(null);
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      title: "Default plan",
      meals: [],
    });
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    await expect(
      getPatientProgressByDate("patient-1", "2026-05-09"),
    ).rejects.toMatchObject({
      message: "Macro goal not found.",
      statusCode: 404,
    });
  });

  it("fails progress calculation when there is no active meal plan", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      calories: 2000,
      protein: 140,
      carbs: 220,
      fat: 60,
    });
    prismaMock.dailyMacroLog.findUnique.mockResolvedValue(null);
    prismaMock.mealPlan.findFirst.mockResolvedValue(null);
    prismaMock.mealCompletion.findMany.mockResolvedValue([]);

    await expect(
      getPatientProgressByDate("patient-1", "2026-05-09"),
    ).rejects.toMatchObject({
      message: "Active meal plan not found.",
      statusCode: 404,
    });
  });

  it("allows a nutritionist to view a linked patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });

    await expect(
      assertNutritionistCanViewPatient("nutri-1", "patient-1"),
    ).resolves.toBeUndefined();
  });

  it("blocks a nutritionist from viewing an unlinked patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-2",
    });

    await expect(
      assertNutritionistCanViewPatient("nutri-1", "patient-1"),
    ).rejects.toMatchObject({
      message: "Insufficient permissions.",
      statusCode: 403,
    });
  });

  it("fails history calculation when the macro goal does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue(null);
    prismaMock.dailyMacroLog.findMany.mockResolvedValue([]);
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      meals: [],
    });

    await expect(
      getPatientProgressHistory(
        "patient-1",
        30,
        new Date("2026-05-17T12:00:00.000Z"),
      ),
    ).rejects.toMatchObject({
      message: "Macro goal not found.",
      statusCode: 404,
    });
  });
});

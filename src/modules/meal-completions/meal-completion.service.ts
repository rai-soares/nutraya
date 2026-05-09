import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  assertNutritionistCanViewPatient,
  parseDateOnly,
  getTodayDateOnly,
} from "@/modules/daily-macro-logs/daily-macro-log.service";

import type {
  MealCompletionDto,
  MealCompletionSummaryDto,
} from "./meal-completion.types";

const mealCompletionSelect = {
  id: true,
  patientId: true,
  mealId: true,
  date: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type ManagedMealRecord = {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealPlan: {
    id: string;
    title: string;
    patientId: string;
    isActive: boolean;
  };
};

function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toMealCompletionDto(completion: {
  id: string;
  patientId: string;
  mealId: string;
  date: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): MealCompletionDto {
  return {
    id: completion.id,
    patientId: completion.patientId,
    mealId: completion.mealId,
    date: formatDateOnly(completion.date),
    completedAt: completion.completedAt.toISOString(),
    createdAt: completion.createdAt.toISOString(),
    updatedAt: completion.updatedAt.toISOString(),
  };
}

async function assertPatientExists(patientId: string): Promise<void> {
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { id: true, role: true },
  });

  if (!patient || patient.role !== UserRole.PATIENT) {
    throw new AppError("Patient not found.", 404);
  }
}

async function getPatientActiveMealRecord(
  patientId: string,
  mealId: string,
): Promise<ManagedMealRecord> {
  await assertPatientExists(patientId);

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    select: {
      id: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      mealPlan: {
        select: {
          id: true,
          title: true,
          patientId: true,
          isActive: true,
        },
      },
    },
  });

  if (!meal) {
    throw new AppError("Meal not found.", 404);
  }

  if (meal.mealPlan.patientId !== patientId || !meal.mealPlan.isActive) {
    throw new AppError("Meal does not belong to the patient's active meal plan.", 400);
  }

  return meal;
}

function clampConsumedValue(value: number): number {
  return value < 0 ? 0 : value;
}

export async function markMealAsCompleted(
  patientId: string,
  mealId: string,
  date: string,
  now = new Date(),
): Promise<MealCompletionDto> {
  const parsedDate = parseDateOnly(date);
  const meal = await getPatientActiveMealRecord(patientId, mealId);

  const completion = await prisma.$transaction(async (tx) => {
    const inserted = await tx.mealCompletion.createMany({
      data: [
        {
          patientId,
          mealId,
          date: parsedDate,
          completedAt: now,
        },
      ],
      skipDuplicates: true,
    });

    if (inserted.count > 0) {
      const currentLog = await tx.dailyMacroLog.findUnique({
        where: {
          patientId_date: {
            patientId,
            date: parsedDate,
          },
        },
        select: {
          caloriesConsumed: true,
          proteinConsumed: true,
          carbsConsumed: true,
          fatConsumed: true,
        },
      });

      await tx.dailyMacroLog.upsert({
        where: {
          patientId_date: {
            patientId,
            date: parsedDate,
          },
        },
        update: {
          caloriesConsumed: (currentLog?.caloriesConsumed ?? 0) + meal.calories,
          proteinConsumed: (currentLog?.proteinConsumed ?? 0) + meal.protein,
          carbsConsumed: (currentLog?.carbsConsumed ?? 0) + meal.carbs,
          fatConsumed: (currentLog?.fatConsumed ?? 0) + meal.fat,
        },
        create: {
          patientId,
          date: parsedDate,
          caloriesConsumed: meal.calories,
          proteinConsumed: meal.protein,
          carbsConsumed: meal.carbs,
          fatConsumed: meal.fat,
        },
      });
    }

    const savedCompletion = await tx.mealCompletion.findUnique({
      where: {
        patientId_mealId_date: {
          patientId,
          mealId,
          date: parsedDate,
        },
      },
      select: mealCompletionSelect,
    });

    if (!savedCompletion) {
      throw new AppError("Meal completion not found.", 500);
    }

    return savedCompletion;
  });

  return toMealCompletionDto(completion);
}

export async function unmarkMealAsCompleted(
  patientId: string,
  mealId: string,
  date: string,
): Promise<void> {
  const parsedDate = parseDateOnly(date);
  const meal = await getPatientActiveMealRecord(patientId, mealId);

  await prisma.$transaction(async (tx) => {
    const completion = await tx.mealCompletion.findUnique({
      where: {
        patientId_mealId_date: {
          patientId,
          mealId,
          date: parsedDate,
        },
      },
      select: {
        id: true,
      },
    });

    if (!completion) {
      return;
    }

    await tx.mealCompletion.delete({
      where: { id: completion.id },
    });

    const log = await tx.dailyMacroLog.findUnique({
      where: {
        patientId_date: {
          patientId,
          date: parsedDate,
        },
      },
      select: {
        id: true,
        caloriesConsumed: true,
        proteinConsumed: true,
        carbsConsumed: true,
        fatConsumed: true,
      },
    });

    if (!log) {
      return;
    }

    await tx.dailyMacroLog.update({
      where: { id: log.id },
      data: {
        caloriesConsumed: clampConsumedValue(log.caloriesConsumed - meal.calories),
        proteinConsumed: clampConsumedValue(log.proteinConsumed - meal.protein),
        carbsConsumed: clampConsumedValue(log.carbsConsumed - meal.carbs),
        fatConsumed: clampConsumedValue(log.fatConsumed - meal.fat),
      },
    });
  });
}

export async function getCompletedMealsForDate(
  patientId: string,
  date: string,
): Promise<MealCompletionDto[]> {
  await assertPatientExists(patientId);
  const parsedDate = parseDateOnly(date);

  const completions = await prisma.mealCompletion.findMany({
    where: {
      patientId,
      date: parsedDate,
    },
    orderBy: {
      completedAt: "asc",
    },
    select: mealCompletionSelect,
  });

  return completions.map(toMealCompletionDto);
}

export async function getTodayCompletedMeals(
  patientId: string,
  now = new Date(),
): Promise<MealCompletionDto[]> {
  return getCompletedMealsForDate(patientId, getTodayDateOnly(now));
}

export async function getCompletedMealsForLinkedPatientByDate(
  nutritionistId: string,
  patientId: string,
  date: string,
): Promise<MealCompletionDto[]> {
  await assertNutritionistCanViewPatient(nutritionistId, patientId);

  return getCompletedMealsForDate(patientId, date);
}

export async function getPatientMealCompletionSummaryByDate(
  nutritionistId: string,
  patientId: string,
  date: string,
): Promise<MealCompletionSummaryDto> {
  await assertNutritionistCanViewPatient(nutritionistId, patientId);

  const parsedDate = parseDateOnly(date);
  const [activePlan, completions] = await Promise.all([
    prisma.mealPlan.findFirst({
      where: {
        patientId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        meals: {
          select: {
            id: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    }),
    prisma.mealCompletion.findMany({
      where: {
        patientId,
        date: parsedDate,
      },
      select: {
        mealId: true,
      },
    }),
  ]);

  if (!activePlan) {
    throw new AppError("Active meal plan not found.", 404);
  }

  const completedMealIds = completions.map((completion) => completion.mealId);

  return {
    date: formatDateOnly(parsedDate),
    mealPlan: {
      id: activePlan.id,
      title: activePlan.title,
    },
    totalMeals: activePlan.meals.length,
    completedMeals: completedMealIds.length,
    pendingMeals: activePlan.meals.length - completedMealIds.length,
    completedMealIds,
  };
}

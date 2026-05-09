import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  DailyMacroLogDto,
  DailyMacroProgressDto,
  UpsertTodayDailyMacroLogInput,
} from "./daily-macro-log.types";

const dailyMacroLogSelect = {
  id: true,
  patientId: true,
  date: true,
  caloriesConsumed: true,
  proteinConsumed: true,
  carbsConsumed: true,
  fatConsumed: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(date: string): Date {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || formatDateOnly(parsed) !== date) {
    throw new AppError("Invalid date.", 400);
  }

  return parsed;
}

export function getTodayDateOnly(now = new Date()): string {
  return formatDateOnly(now);
}

function toDailyMacroLogDto(log: {
  id: string;
  patientId: string;
  date: Date;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  createdAt: Date;
  updatedAt: Date;
}): DailyMacroLogDto {
  return {
    id: log.id,
    patientId: log.patientId,
    date: formatDateOnly(log.date),
    caloriesConsumed: log.caloriesConsumed,
    proteinConsumed: log.proteinConsumed,
    carbsConsumed: log.carbsConsumed,
    fatConsumed: log.fatConsumed,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
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

export async function assertNutritionistCanViewPatient(
  nutritionistId: string,
  patientId: string,
): Promise<void> {
  await assertPatientExists(patientId);

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
    select: { nutritionistId: true },
  });

  if (!profile || profile.nutritionistId !== nutritionistId) {
    throw new AppError("Insufficient permissions.", 403);
  }
}

export async function upsertTodayDailyMacroLog(
  patientId: string,
  input: UpsertTodayDailyMacroLogInput,
  now = new Date(),
): Promise<DailyMacroLogDto> {
  await assertPatientExists(patientId);

  const date = parseDateOnly(getTodayDateOnly(now));
  const log = await prisma.dailyMacroLog.upsert({
    where: {
      patientId_date: {
        patientId,
        date,
      },
    },
    update: input,
    create: {
      patientId,
      date,
      ...input,
    },
    select: dailyMacroLogSelect,
  });

  return toDailyMacroLogDto(log);
}

export async function getDailyMacroLogByDate(
  patientId: string,
  date: string,
): Promise<DailyMacroLogDto> {
  await assertPatientExists(patientId);

  const log = await prisma.dailyMacroLog.findUnique({
    where: {
      patientId_date: {
        patientId,
        date: parseDateOnly(date),
      },
    },
    select: dailyMacroLogSelect,
  });

  if (!log) {
    throw new AppError("Daily macro log not found.", 404);
  }

  return toDailyMacroLogDto(log);
}

export async function getTodayDailyMacroLog(
  patientId: string,
  now = new Date(),
): Promise<DailyMacroLogDto> {
  return getDailyMacroLogByDate(patientId, getTodayDateOnly(now));
}

function calculateProgressValue(goal: number, consumed: number): number {
  if (goal <= 0) {
    return consumed > 0 ? 100 : 0;
  }

  return Math.round((consumed / goal) * 100);
}

export async function getPatientProgressByDate(
  patientId: string,
  date: string,
): Promise<DailyMacroProgressDto> {
  await assertPatientExists(patientId);

  const parsedDate = parseDateOnly(date);
  const [goal, log, activePlan, completions] = await Promise.all([
    prisma.macroGoal.findUnique({
      where: { patientId },
      select: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    }),
    prisma.dailyMacroLog.findUnique({
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
    }),
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
            name: true,
            description: true,
            scheduledTime: true,
            order: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
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

  if (!goal) {
    throw new AppError("Macro goal not found.", 404);
  }

  if (!activePlan) {
    throw new AppError("Active meal plan not found.", 404);
  }

  const consumed = {
    calories: log?.caloriesConsumed ?? 0,
    protein: log?.proteinConsumed ?? 0,
    carbs: log?.carbsConsumed ?? 0,
    fat: log?.fatConsumed ?? 0,
  };
  const completedMealIds = completions.map((completion) => completion.mealId);
  const completedMealIdSet = new Set(completedMealIds);

  return {
    date: formatDateOnly(parsedDate),
    goals: goal,
    consumed,
    remaining: {
      calories: goal.calories - consumed.calories,
      protein: goal.protein - consumed.protein,
      carbs: goal.carbs - consumed.carbs,
      fat: goal.fat - consumed.fat,
    },
    progress: {
      calories: calculateProgressValue(goal.calories, consumed.calories),
      protein: calculateProgressValue(goal.protein, consumed.protein),
      carbs: calculateProgressValue(goal.carbs, consumed.carbs),
      fat: calculateProgressValue(goal.fat, consumed.fat),
    },
    mealPlan: {
      id: activePlan.id,
      title: activePlan.title,
    },
    meals: activePlan.meals.map((meal) => ({
      ...meal,
      completed: completedMealIdSet.has(meal.id),
    })),
    completedMealIds,
  };
}

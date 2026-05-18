import { z } from "zod";

const consumedMacroSchema = z.number().int().nonnegative();

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.");

export const upsertTodayDailyMacroLogSchema = z.object({
  caloriesConsumed: consumedMacroSchema,
  proteinConsumed: consumedMacroSchema,
  carbsConsumed: consumedMacroSchema,
  fatConsumed: consumedMacroSchema,
});

export const dailyMacroLogDateQuerySchema = z.object({
  date: isoDateSchema,
});

export const progressHistoryRangeSchema = z
  .coerce
  .number()
  .int()
  .refine((value) => [7, 30, 90].includes(value), {
    message: "Range must be 7, 30, or 90.",
  });

export type UpsertTodayDailyMacroLogInput = z.infer<
  typeof upsertTodayDailyMacroLogSchema
>;

export type DailyMacroLogDateQuery = z.infer<typeof dailyMacroLogDateQuerySchema>;
export type ProgressHistoryRange = z.infer<typeof progressHistoryRangeSchema>;

export type DailyMacroLogDto = {
  id: string;
  patientId: string;
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  createdAt: string;
  updatedAt: string;
};

export type DailyMacroProgressDto = {
  date: string;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealPlan: {
    id: string;
    title: string;
  };
  meals: Array<{
    id: string;
    name: string;
    description: string | null;
    scheduledTime: string | null;
    order: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    completed: boolean;
  }>;
  completedMealIds: string[];
};

export type PatientProgressHistoryDayDto = {
  date: string;
  calories: {
    consumed: number;
    goal: number;
  };
  protein: {
    consumed: number;
    goal: number;
  };
  carbs: {
    consumed: number;
    goal: number;
  };
  fat: {
    consumed: number;
    goal: number;
  };
  completedMeals: number;
  totalMeals: number;
  adherencePercentage: number;
};

export type PatientProgressHistoryDto = {
  range: ProgressHistoryRange;
  summary: {
    averageAdherence: number;
    daysTracked: number;
    completedMeals: number;
    totalMeals: number;
  };
  history: PatientProgressHistoryDayDto[];
};

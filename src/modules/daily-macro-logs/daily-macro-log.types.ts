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

export type UpsertTodayDailyMacroLogInput = z.infer<
  typeof upsertTodayDailyMacroLogSchema
>;

export type DailyMacroLogDateQuery = z.infer<typeof dailyMacroLogDateQuerySchema>;

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
};

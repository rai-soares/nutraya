import { z } from "zod";

import { isoDateSchema } from "@/modules/daily-macro-logs/daily-macro-log.types";

const requiredString = (field: string) =>
  z.string().trim().min(1, `${field} is required.`);

export const mealCompletionBodySchema = z.object({
  mealId: requiredString("Meal ID"),
  date: isoDateSchema,
});

export const mealCompletionQuerySchema = z.object({
  date: isoDateSchema,
});

export type MealCompletionInput = z.infer<typeof mealCompletionBodySchema>;
export type MealCompletionQuery = z.infer<typeof mealCompletionQuerySchema>;

export type MealCompletionDto = {
  id: string;
  patientId: string;
  mealId: string;
  date: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type MealCompletionSummaryDto = {
  date: string;
  mealPlan: {
    id: string;
    title: string;
  };
  totalMeals: number;
  completedMeals: number;
  pendingMeals: number;
  completedMealIds: string[];
};

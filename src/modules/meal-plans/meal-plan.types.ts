import { z } from "zod";

const requiredString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const optionalNullableText = z.union([z.string().trim(), z.null()]).optional();

const nonNegativeInt = z.number().int().nonnegative();

export const scheduledTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Scheduled time must be in HH:MM format.");

export const createMealPlanSchema = z.object({
  patientId: requiredString("Patient ID"),
  title: requiredString("Title"),
  description: optionalNullableText,
  isActive: z.boolean().optional().default(false),
});

export const updateMealPlanSchema = z
  .object({
    title: requiredString("Title").optional(),
    description: optionalNullableText,
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.isActive !== undefined,
    { message: "At least one field is required." },
  );

export const createMealSchema = z.object({
  name: requiredString("Meal name"),
  description: optionalNullableText,
  scheduledTime: z.union([scheduledTimeSchema, z.null()]).optional(),
  order: nonNegativeInt,
  calories: nonNegativeInt,
  protein: nonNegativeInt,
  carbs: nonNegativeInt,
  fat: nonNegativeInt,
});

export const updateMealSchema = z
  .object({
    name: requiredString("Meal name").optional(),
    description: optionalNullableText,
    scheduledTime: z.union([scheduledTimeSchema, z.null()]).optional(),
    order: nonNegativeInt.optional(),
    calories: nonNegativeInt.optional(),
    protein: nonNegativeInt.optional(),
    carbs: nonNegativeInt.optional(),
    fat: nonNegativeInt.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.scheduledTime !== undefined ||
      value.order !== undefined ||
      value.calories !== undefined ||
      value.protein !== undefined ||
      value.carbs !== undefined ||
      value.fat !== undefined,
    { message: "At least one field is required." },
  );

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export type MealDto = {
  id: string;
  mealPlanId: string;
  name: string;
  description: string | null;
  scheduledTime: string | null;
  order: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  updatedAt: string;
};

export type MealPlanDto = {
  id: string;
  patientId: string;
  nutritionistId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MealPlanWithMealsDto = MealPlanDto & {
  meals: MealDto[];
};

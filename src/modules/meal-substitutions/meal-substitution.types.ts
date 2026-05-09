import { z } from "zod";

const requiredText = (field: string) =>
  z.string().trim().min(1, `${field} is required.`);

export const mealSubstitutionIdParamSchema = z.object({
  substitutionId: requiredText("Substitution request ID"),
});

export const patientMealSubstitutionBodySchema = z.object({
  mealId: requiredText("Meal ID"),
  imageUrl: requiredText("Image URL").url("Image URL must be a valid URL."),
  note: z
    .string()
    .trim()
    .max(1000, "Note is too long.")
    .optional(),
});

export const nutritionistReviewMealSubstitutionBodySchema = z.object({
  nutritionistFeedback: z
    .string()
    .trim()
    .max(1000, "Nutritionist feedback is too long.")
    .optional(),
});

export const nutritionistMealSubstitutionQuerySchema = z.object({
  patientId: requiredText("Patient ID").optional(),
});

export type CreateMealSubstitutionInput = z.infer<
  typeof patientMealSubstitutionBodySchema
>;

export type ReviewMealSubstitutionInput = z.infer<
  typeof nutritionistReviewMealSubstitutionBodySchema
>;

export type MealSubstitutionIdParamInput = z.infer<
  typeof mealSubstitutionIdParamSchema
>;

export type NutritionistMealSubstitutionQueryInput = z.infer<
  typeof nutritionistMealSubstitutionQuerySchema
>;

export type MealSubstitutionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MealSubstitutionDto = {
  id: string;
  patientId: string;
  nutritionistId: string;
  mealId: string;
  imageUrl: string;
  note: string | null;
  status: MealSubstitutionStatus;
  nutritionistFeedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
  };
  nutritionist: {
    id: string;
    name: string;
  };
  meal: {
    id: string;
    name: string;
    mealPlanId: string;
  };
};

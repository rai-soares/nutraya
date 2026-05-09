import { z } from "zod";

const requiredText = (field: string) =>
  z.string().trim().min(1, `${field} is required.`);

export const mealMacroConfidenceSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

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

export const nutritionistMealSubstitutionFeedbackBodySchema = z.object({
  nutritionistFeedback: z
    .string()
    .trim()
    .max(1000, "Nutritionist feedback is too long.")
    .optional(),
});

export const nutritionistMealSubstitutionQuerySchema = z.object({
  patientId: requiredText("Patient ID").optional(),
});

export const mealSubstitutionEstimateMacrosBodySchema = z.object({
  force: z.boolean().optional(),
});

export type CreateMealSubstitutionInput = z.infer<
  typeof patientMealSubstitutionBodySchema
>;

export type SaveMealSubstitutionFeedbackInput = z.infer<
  typeof nutritionistMealSubstitutionFeedbackBodySchema
>;

export type MealSubstitutionIdParamInput = z.infer<
  typeof mealSubstitutionIdParamSchema
>;

export type NutritionistMealSubstitutionQueryInput = z.infer<
  typeof nutritionistMealSubstitutionQuerySchema
>;

export type MealSubstitutionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MealMacroConfidence = z.infer<typeof mealMacroConfidenceSchema>;

export type EstimateMealSubstitutionMacrosInput = z.infer<
  typeof mealSubstitutionEstimateMacrosBodySchema
>;

export type MealMacroEstimationDto = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealSubstitutionDto = {
  id: string;
  patientId: string;
  nutritionistId: string;
  mealId: string;
  imageUrl: string;
  note: string | null;
  status: MealSubstitutionStatus;
  nutritionistFeedback: string | null;
  estimatedCalories: number | null;
  estimatedProtein: number | null;
  estimatedCarbs: number | null;
  estimatedFat: number | null;
  estimatedFoods: string[] | null;
  portionEstimate: string | null;
  confidence: MealMacroConfidence | null;
  aiNotes: string | null;
  estimatedAt: string | null;
  reviewedAt: string | null;
  appliedToDailyLog: boolean;
  appliedAt: string | null;
  appliedByUserId: string | null;
  appliedDailyLogId: string | null;
  applicationDate: string | null;
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

export type MealSubstitutionMacroEstimationResponseDto = {
  substitutionId: string;
  imageUrl: string;
  estimatedMacros: MealMacroEstimationDto;
  identifiedFoods: string[];
  portionEstimate: string;
  confidence: MealMacroConfidence;
  notes: string;
  estimatedAt: string;
};

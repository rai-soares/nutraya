import { apiClient } from "@/modules/shared/api/api-client";
import type {
  MealSubstitution,
  MealSubstitutionMacroEstimationResponse,
} from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export type CreateMealSubstitutionPayload = {
  mealId: string;
  imageUrl: string;
  note?: string;
};

export type SaveMealSubstitutionFeedbackPayload = {
  nutritionistFeedback?: string;
};

export type EstimateMealSubstitutionPayload = {
  force?: boolean;
};

export function createPatientMealSubstitution(
  payload: CreateMealSubstitutionPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitution>(
    "/api/patient/meal-substitutions",
    payload,
    options,
  );
}

export function listPatientMealSubstitutions(options: AuthOptions) {
  return apiClient.get<MealSubstitution[]>("/api/patient/meal-substitutions", options);
}

export function getPatientMealSubstitution(
  substitutionId: string,
  options: AuthOptions,
) {
  return apiClient.get<MealSubstitution>(
    `/api/patient/meal-substitutions/${substitutionId}`,
    options,
  );
}

export function estimatePatientMealSubstitutionMacros(
  substitutionId: string,
  payload: EstimateMealSubstitutionPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitutionMacroEstimationResponse>(
    `/api/patient/meal-substitutions/${substitutionId}/estimate-macros`,
    payload,
    options,
  );
}

export function listNutritionistMealSubstitutions(
  options: AuthOptions,
  patientId?: string,
) {
  const search = patientId
    ? `?patientId=${encodeURIComponent(patientId)}`
    : "";

  return apiClient.get<MealSubstitution[]>(
    `/api/nutritionist/meal-substitutions${search}`,
    options,
  );
}

export function getNutritionistMealSubstitution(
  substitutionId: string,
  options: AuthOptions,
) {
  return apiClient.get<MealSubstitution>(
    `/api/nutritionist/meal-substitutions/${substitutionId}`,
    options,
  );
}

export function estimateNutritionistMealSubstitutionMacros(
  substitutionId: string,
  payload: EstimateMealSubstitutionPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitutionMacroEstimationResponse>(
    `/api/nutritionist/meal-substitutions/${substitutionId}/estimate-macros`,
    payload,
    options,
  );
}

export function saveNutritionistMealSubstitutionFeedback(
  substitutionId: string,
  payload: SaveMealSubstitutionFeedbackPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitution>(
    `/api/nutritionist/meal-substitutions/${substitutionId}/feedback`,
    payload,
    options,
  );
}

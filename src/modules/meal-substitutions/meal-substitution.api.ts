import { apiClient } from "@/modules/shared/api/api-client";
import type { MealSubstitution } from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export type CreateMealSubstitutionPayload = {
  mealId: string;
  imageUrl: string;
  note?: string;
};

export type ReviewMealSubstitutionPayload = {
  nutritionistFeedback?: string;
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

export function approveNutritionistMealSubstitution(
  substitutionId: string,
  payload: ReviewMealSubstitutionPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitution>(
    `/api/nutritionist/meal-substitutions/${substitutionId}/approve`,
    payload,
    options,
  );
}

export function rejectNutritionistMealSubstitution(
  substitutionId: string,
  payload: ReviewMealSubstitutionPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealSubstitution>(
    `/api/nutritionist/meal-substitutions/${substitutionId}/reject`,
    payload,
    options,
  );
}

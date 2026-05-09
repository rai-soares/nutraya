import { apiClient } from "@/modules/shared/api/api-client";
import type {
  MacroGoal,
  Meal,
  MealPlan,
  MealPlanWithMeals,
  NutritionistPatient,
} from "@/modules/shared/types/api";

type AuthOptions = {
  token: string;
};

export type CreateNutritionistPatientPayload = {
  name: string;
  email: string;
  password: string;
};

export type MacroGoalPayload = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPlanPayload = {
  patientId: string;
  title: string;
  description?: string | null;
  isActive?: boolean;
};

export type MealPayload = {
  name: string;
  description?: string | null;
  scheduledTime?: string | null;
  order: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function listNutritionistPatients(options: AuthOptions) {
  return apiClient.get<NutritionistPatient[]>("/api/nutritionist/patients", options);
}

export function getNutritionistPatient(patientId: string, options: AuthOptions) {
  return apiClient.get<NutritionistPatient>(
    `/api/nutritionist/patients/${patientId}`,
    options,
  );
}

export function createNutritionistPatient(
  payload: CreateNutritionistPatientPayload,
  options: AuthOptions,
) {
  return apiClient.post<{ patient: NutritionistPatient["patient"]; profile: { id: string; userId: string; nutritionistId: string } }>(
    "/api/nutritionist/patients",
    payload,
    options,
  );
}

export function getPatientMacroGoal(patientId: string, options: AuthOptions) {
  return apiClient.get<MacroGoal>(`/api/macro-goals/patient/${patientId}`, options);
}

export function createPatientMacroGoal(
  patientId: string,
  payload: MacroGoalPayload,
  options: AuthOptions,
) {
  return apiClient.post<MacroGoal>(
    "/api/macro-goals",
    { patientId, ...payload },
    options,
  );
}

export function updatePatientMacroGoal(
  patientId: string,
  payload: MacroGoalPayload,
  options: AuthOptions,
) {
  return apiClient.patch<MacroGoal>(
    `/api/macro-goals/patient/${patientId}`,
    payload,
    options,
  );
}

export function listPatientMealPlans(patientId: string, options: AuthOptions) {
  return apiClient.get<MealPlan[]>(`/api/meal-plans/patient/${patientId}`, options);
}

export function getMealPlan(mealPlanId: string, options: AuthOptions) {
  return apiClient.get<MealPlanWithMeals>(`/api/meal-plans/${mealPlanId}`, options);
}

export function createPatientMealPlan(
  payload: MealPlanPayload,
  options: AuthOptions,
) {
  return apiClient.post<MealPlan>("/api/meal-plans", payload, options);
}

export function activatePatientMealPlan(mealPlanId: string, options: AuthOptions) {
  return apiClient.post<MealPlan>(`/api/meal-plans/${mealPlanId}/activate`, undefined, options);
}

export function createMealForMealPlan(
  mealPlanId: string,
  payload: MealPayload,
  options: AuthOptions,
) {
  return apiClient.post<Meal>(`/api/meal-plans/${mealPlanId}/meals`, payload, options);
}

export function updateMealForMealPlan(
  mealPlanId: string,
  mealId: string,
  payload: MealPayload,
  options: AuthOptions,
) {
  return apiClient.patch<Meal>(
    `/api/meal-plans/${mealPlanId}/meals/${mealId}`,
    payload,
    options,
  );
}

export function deleteMealFromMealPlan(
  mealPlanId: string,
  mealId: string,
  options: AuthOptions,
) {
  return apiClient.delete<{ success: boolean }>(
    `/api/meal-plans/${mealPlanId}/meals/${mealId}`,
    undefined,
    options,
  );
}

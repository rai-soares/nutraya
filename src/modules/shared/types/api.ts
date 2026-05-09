export type UserRole = "NUTRI" | "PATIENT";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string | Date;
};

export type NutritionistPatient = {
  id: string;
  userId: string;
  nutritionistId: string;
  patient: AppUser & { role: "PATIENT"; createdAt: string };
};

export type AuthResponse = {
  token: string;
  user: AppUser;
};

export type ApiErrorResponse = {
  message: string;
  issues?: unknown;
};

export type MacroSnapshot = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroGoal = {
  id: string;
  patientId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = {
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

export type DailyMacroProgress = {
  date: string;
  goals: MacroSnapshot;
  consumed: MacroSnapshot;
  remaining: MacroSnapshot;
  progress: MacroSnapshot;
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

export type MealPlan = {
  id: string;
  patientId: string;
  nutritionistId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MealPlanWithMeals = MealPlan & {
  meals: Meal[];
};

export type MealCompletionSummary = {
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

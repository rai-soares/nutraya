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

export type PatientProfileSummary = {
  nutritionist: {
    id: string;
    name: string;
  } | null;
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

export type MealSubstitutionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MealMacroConfidence = "LOW" | "MEDIUM" | "HIGH";

export type MealMacroEstimation = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealSubstitutionMacroEstimationResponse = {
  substitutionId: string;
  imageUrl: string;
  estimatedMacros: MealMacroEstimation;
  identifiedFoods: string[];
  portionEstimate: string;
  confidence: MealMacroConfidence;
  notes: string;
  estimatedAt: string;
};

export type MealSubstitution = {
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

export type PatientProgressHistoryDay = {
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

export type PatientProgressHistory = {
  range: 7 | 30 | 90;
  summary: {
    averageAdherence: number;
    daysTracked: number;
    completedMeals: number;
    totalMeals: number;
  };
  history: PatientProgressHistoryDay[];
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

export type ConversationParticipant = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Conversation = {
  id: string;
  patientId: string;
  nutritionistId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  patient: ConversationParticipant;
  nutritionist: ConversationParticipant;
};

export type ConversationListItem = {
  conversationId: string;
  patientId: string;
  nutritionistId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  patient: ConversationParticipant;
  nutritionist: ConversationParticipant;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: "TEXT" | "IMAGE";
  text: string | null;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarkMessagesReadResponse = {
  updatedCount: number;
};

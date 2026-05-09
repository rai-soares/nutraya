import {
  MealMacroConfidence,
  MealSubstitutionStatus,
  UserRole,
} from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { assertNutritionistCanAccessPatient } from "@/modules/patient-profile/patient-profile.service";

import type {
  CreateMealSubstitutionInput,
  EstimateMealSubstitutionMacrosInput,
  MealSubstitutionMacroEstimationResponseDto,
  MealSubstitutionDto,
  ReviewMealSubstitutionInput,
} from "./meal-substitution.types";
import { estimateMealPhotoMacros } from "./meal-substitution-estimation.service";

const mealSubstitutionSelect = {
  id: true,
  patientId: true,
  nutritionistId: true,
  mealId: true,
  imageUrl: true,
  note: true,
  status: true,
  nutritionistFeedback: true,
  estimatedCalories: true,
  estimatedProtein: true,
  estimatedCarbs: true,
  estimatedFat: true,
  estimatedFoods: true,
  portionEstimate: true,
  confidence: true,
  aiNotes: true,
  estimatedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  patient: {
    select: {
      id: true,
      name: true,
    },
  },
  nutritionist: {
    select: {
      id: true,
      name: true,
    },
  },
  meal: {
    select: {
      id: true,
      name: true,
      mealPlanId: true,
    },
  },
} as const;

function toMealSubstitutionDto(substitution: {
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
  estimatedFoods: unknown;
  portionEstimate: string | null;
  confidence: MealMacroConfidence | null;
  aiNotes: string | null;
  estimatedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
}): MealSubstitutionDto {
  return {
    ...substitution,
    estimatedFoods: Array.isArray(substitution.estimatedFoods)
      ? substitution.estimatedFoods.filter(
          (value): value is string => typeof value === "string",
        )
      : null,
    estimatedAt: substitution.estimatedAt?.toISOString() ?? null,
    reviewedAt: substitution.reviewedAt?.toISOString() ?? null,
    createdAt: substitution.createdAt.toISOString(),
    updatedAt: substitution.updatedAt.toISOString(),
  };
}

function assertValidEstimateSourceImageUrl(imageUrl: string): void {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new AppError("Meal image URL is invalid.", 400);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new AppError("Meal image URL is invalid.", 400);
  }
}

function hasStoredEstimation(substitution: MealSubstitutionDto): boolean {
  return Boolean(
    substitution.estimatedAt &&
      substitution.estimatedCalories !== null &&
      substitution.estimatedProtein !== null &&
      substitution.estimatedCarbs !== null &&
      substitution.estimatedFat !== null &&
      substitution.portionEstimate &&
      substitution.confidence &&
      substitution.aiNotes,
  );
}

function toMealSubstitutionMacroEstimationResponse(
  substitution: MealSubstitutionDto,
): MealSubstitutionMacroEstimationResponseDto {
  if (
    substitution.estimatedCalories === null ||
    substitution.estimatedProtein === null ||
    substitution.estimatedCarbs === null ||
    substitution.estimatedFat === null ||
    !substitution.portionEstimate ||
    !substitution.confidence ||
    !substitution.aiNotes ||
    !substitution.estimatedAt
  ) {
    throw new AppError("Meal substitution estimation is not available yet.", 409);
  }

  return {
    substitutionId: substitution.id,
    imageUrl: substitution.imageUrl,
    estimatedMacros: {
      calories: substitution.estimatedCalories,
      protein: substitution.estimatedProtein,
      carbs: substitution.estimatedCarbs,
      fat: substitution.estimatedFat,
    },
    identifiedFoods: substitution.estimatedFoods ?? [],
    portionEstimate: substitution.portionEstimate,
    confidence: substitution.confidence,
    notes: substitution.aiNotes,
    estimatedAt: substitution.estimatedAt,
  };
}

async function assertPatientExists(patientId: string): Promise<void> {
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { id: true, role: true },
  });

  if (!patient || patient.role !== UserRole.PATIENT) {
    throw new AppError("Patient not found.", 404);
  }
}

async function getPatientMealForActivePlan(patientId: string, mealId: string) {
  await assertPatientExists(patientId);

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    select: {
      id: true,
      name: true,
      mealPlanId: true,
      mealPlan: {
        select: {
          patientId: true,
          nutritionistId: true,
          isActive: true,
        },
      },
    },
  });

  if (!meal) {
    throw new AppError("Meal not found.", 404);
  }

  if (meal.mealPlan.patientId !== patientId || !meal.mealPlan.isActive) {
    throw new AppError("Meal does not belong to the patient's active meal plan.", 400);
  }

  return meal;
}

async function getMealSubstitutionById(
  substitutionId: string,
): Promise<MealSubstitutionDto> {
  const substitution = await prisma.mealSubstitution.findUnique({
    where: { id: substitutionId },
    select: mealSubstitutionSelect,
  });

  if (!substitution) {
    throw new AppError("Meal substitution request not found.", 404);
  }

  return toMealSubstitutionDto(substitution);
}

export async function createMealSubstitution(
  patientId: string,
  input: CreateMealSubstitutionInput,
): Promise<MealSubstitutionDto> {
  const meal = await getPatientMealForActivePlan(patientId, input.mealId);

  const substitution = await prisma.mealSubstitution.create({
    data: {
      patientId,
      nutritionistId: meal.mealPlan.nutritionistId,
      mealId: meal.id,
      imageUrl: input.imageUrl,
      note: input.note?.trim() || null,
      status: MealSubstitutionStatus.PENDING,
    },
    select: mealSubstitutionSelect,
  });

  try {
    const estimation = await estimateMealSubstitutionMacros(
      toMealSubstitutionDto(substitution),
      { force: true },
    );

    return getPatientMealSubstitutionById(patientId, estimation.substitutionId);
  } catch (error) {
    await prisma.mealSubstitution
      .delete({
        where: { id: substitution.id },
      })
      .catch(() => undefined);

    throw error;
  }
}

export async function listPatientMealSubstitutions(
  patientId: string,
): Promise<MealSubstitutionDto[]> {
  await assertPatientExists(patientId);

  const substitutions = await prisma.mealSubstitution.findMany({
    where: { patientId },
    orderBy: [{ createdAt: "desc" }],
    select: mealSubstitutionSelect,
  });

  return substitutions.map(toMealSubstitutionDto);
}

export async function getPatientMealSubstitutionById(
  patientId: string,
  substitutionId: string,
): Promise<MealSubstitutionDto> {
  const substitution = await getMealSubstitutionById(substitutionId);

  if (substitution.patientId !== patientId) {
    throw new AppError("Meal substitution request not found.", 404);
  }

  return substitution;
}

export async function listNutritionistMealSubstitutions(
  nutritionistId: string,
  patientId?: string,
): Promise<MealSubstitutionDto[]> {
  if (patientId) {
    await assertNutritionistCanAccessPatient(nutritionistId, patientId);
  }

  const substitutions = await prisma.mealSubstitution.findMany({
    where: {
      nutritionistId,
      ...(patientId ? { patientId } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: mealSubstitutionSelect,
  });

  return substitutions.map(toMealSubstitutionDto);
}

export async function getNutritionistMealSubstitutionById(
  nutritionistId: string,
  substitutionId: string,
): Promise<MealSubstitutionDto> {
  const substitution = await getMealSubstitutionById(substitutionId);

  if (substitution.nutritionistId !== nutritionistId) {
    throw new AppError("Meal substitution request not found.", 404);
  }

  await assertNutritionistCanAccessPatient(nutritionistId, substitution.patientId);

  return substitution;
}

async function estimateMealSubstitutionMacros(
  substitution: MealSubstitutionDto,
  input?: EstimateMealSubstitutionMacrosInput,
): Promise<MealSubstitutionMacroEstimationResponseDto> {
  if (!substitution.imageUrl) {
    throw new AppError(
      "Only substitution requests with a meal image can be estimated.",
      400,
    );
  }

  if (hasStoredEstimation(substitution) && !input?.force) {
    return toMealSubstitutionMacroEstimationResponse(substitution);
  }

  assertValidEstimateSourceImageUrl(substitution.imageUrl);

  try {
    const estimation = await estimateMealPhotoMacros(substitution.imageUrl);
    const estimatedAt = new Date();
    const updatedSubstitution = await prisma.mealSubstitution.update({
      where: { id: substitution.id },
      data: {
        estimatedCalories: estimation.calories,
        estimatedProtein: estimation.protein,
        estimatedCarbs: estimation.carbs,
        estimatedFat: estimation.fat,
        estimatedFoods: estimation.identifiedFoods,
        portionEstimate: estimation.portionEstimate,
        confidence: estimation.confidence,
        aiNotes: estimation.notes,
        estimatedAt,
      },
      select: mealSubstitutionSelect,
    });

    return toMealSubstitutionMacroEstimationResponse(
      toMealSubstitutionDto(updatedSubstitution),
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof SyntaxError || error instanceof ZodError) {
      throw new AppError("AI estimation returned an invalid result.", 502);
    }

    throw new AppError("Unable to estimate meal macros right now.", 502);
  }
}

export async function estimatePatientMealSubstitutionMacros(
  patientId: string,
  substitutionId: string,
  input?: EstimateMealSubstitutionMacrosInput,
): Promise<MealSubstitutionMacroEstimationResponseDto> {
  const substitution = await getPatientMealSubstitutionById(patientId, substitutionId);

  return estimateMealSubstitutionMacros(substitution, input);
}

export async function estimateNutritionistMealSubstitutionMacros(
  nutritionistId: string,
  substitutionId: string,
  input?: EstimateMealSubstitutionMacrosInput,
): Promise<MealSubstitutionMacroEstimationResponseDto> {
  const substitution = await getNutritionistMealSubstitutionById(
    nutritionistId,
    substitutionId,
  );

  return estimateMealSubstitutionMacros(substitution, input);
}

async function reviewMealSubstitution(
  nutritionistId: string,
  substitutionId: string,
  status: "APPROVED" | "REJECTED",
  input: ReviewMealSubstitutionInput,
): Promise<MealSubstitutionDto> {
  const substitution = await getNutritionistMealSubstitutionById(
    nutritionistId,
    substitutionId,
  );

  if (substitution.status !== MealSubstitutionStatus.PENDING) {
    throw new AppError("Meal substitution request has already been reviewed.", 409);
  }

  const reviewedAt = new Date();
  const updated = await prisma.mealSubstitution.update({
    where: { id: substitutionId },
    data: {
      status,
      nutritionistFeedback: input.nutritionistFeedback?.trim() || null,
      reviewedAt,
    },
    select: mealSubstitutionSelect,
  });

  return toMealSubstitutionDto(updated);
}

export async function approveMealSubstitution(
  nutritionistId: string,
  substitutionId: string,
  input: ReviewMealSubstitutionInput,
): Promise<MealSubstitutionDto> {
  return reviewMealSubstitution(
    nutritionistId,
    substitutionId,
    MealSubstitutionStatus.APPROVED,
    input,
  );
}

export async function rejectMealSubstitution(
  nutritionistId: string,
  substitutionId: string,
  input: ReviewMealSubstitutionInput,
): Promise<MealSubstitutionDto> {
  return reviewMealSubstitution(
    nutritionistId,
    substitutionId,
    MealSubstitutionStatus.REJECTED,
    input,
  );
}

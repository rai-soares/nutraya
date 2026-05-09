import { MealSubstitutionStatus, UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { assertNutritionistCanAccessPatient } from "@/modules/patient-profile/patient-profile.service";

import type {
  CreateMealSubstitutionInput,
  MealSubstitutionDto,
  ReviewMealSubstitutionInput,
} from "./meal-substitution.types";

const mealSubstitutionSelect = {
  id: true,
  patientId: true,
  nutritionistId: true,
  mealId: true,
  imageUrl: true,
  note: true,
  status: true,
  nutritionistFeedback: true,
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
    reviewedAt: substitution.reviewedAt?.toISOString() ?? null,
    createdAt: substitution.createdAt.toISOString(),
    updatedAt: substitution.updatedAt.toISOString(),
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

  return toMealSubstitutionDto(substitution);
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

async function reviewMealSubstitution(
  nutritionistId: string,
  substitutionId: string,
  status: MealSubstitutionStatus.APPROVED | MealSubstitutionStatus.REJECTED,
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

import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  CreateMealInput,
  CreateMealPlanInput,
  MealDto,
  MealPlanDto,
  MealPlanWithMealsDto,
  UpdateMealInput,
  UpdateMealPlanInput,
} from "./meal-plan.types";

const mealSelect = {
  id: true,
  mealPlanId: true,
  name: true,
  description: true,
  scheduledTime: true,
  order: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  createdAt: true,
  updatedAt: true,
} as const;

const mealPlanSelect = {
  id: true,
  patientId: true,
  nutritionistId: true,
  title: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const mealPlanWithMealsSelect = {
  ...mealPlanSelect,
  meals: {
    select: mealSelect,
    orderBy: {
      order: "asc",
    },
  },
} as const;

function toMealDto(meal: {
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
  createdAt: Date;
  updatedAt: Date;
}): MealDto {
  return {
    ...meal,
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
  };
}

function toMealPlanDto(plan: {
  id: string;
  patientId: string;
  nutritionistId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MealPlanDto {
  return {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

function toMealPlanWithMealsDto(plan: {
  id: string;
  patientId: string;
  nutritionistId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals: Array<{
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
    createdAt: Date;
    updatedAt: Date;
  }>;
}): MealPlanWithMealsDto {
  return {
    ...toMealPlanDto(plan),
    meals: plan.meals.map(toMealDto),
  };
}

async function assertPatientManagedByNutritionist(
  nutritionistId: string,
  patientId: string,
): Promise<void> {
  const [patient, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true },
    }),
    prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: { nutritionistId: true },
    }),
  ]);

  if (!patient || patient.role !== UserRole.PATIENT) {
    throw new AppError("Patient not found.", 404);
  }

  if (!profile || profile.nutritionistId !== nutritionistId) {
    throw new AppError("Patient is not linked to this nutritionist.", 403);
  }
}

async function getManagedMealPlanRecord(
  nutritionistId: string,
  mealPlanId: string,
) {
  const plan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    select: mealPlanWithMealsSelect,
  });

  if (!plan) {
    throw new AppError("Meal plan not found.", 404);
  }

  if (plan.nutritionistId !== nutritionistId) {
    throw new AppError("Insufficient permissions.", 403);
  }

  return plan;
}

async function assertMealBelongsToPlan(
  mealPlanId: string,
  mealId: string,
): Promise<void> {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    select: { id: true, mealPlanId: true },
  });

  if (!meal) {
    throw new AppError("Meal not found.", 404);
  }

  if (meal.mealPlanId !== mealPlanId) {
    throw new AppError("Meal does not belong to this meal plan.", 400);
  }
}

export async function createMealPlan(
  nutritionistId: string,
  input: CreateMealPlanInput,
): Promise<MealPlanDto> {
  await assertPatientManagedByNutritionist(nutritionistId, input.patientId);

  if (input.isActive) {
    const plan = await prisma.$transaction(async (tx) => {
      await tx.mealPlan.updateMany({
        where: {
          patientId: input.patientId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return tx.mealPlan.create({
        data: {
          patientId: input.patientId,
          nutritionistId,
          title: input.title,
          description: input.description ?? null,
          isActive: true,
        },
        select: mealPlanSelect,
      });
    });

    return toMealPlanDto(plan);
  }

  const plan = await prisma.mealPlan.create({
    data: {
      patientId: input.patientId,
      nutritionistId,
      title: input.title,
      description: input.description ?? null,
      isActive: false,
    },
    select: mealPlanSelect,
  });

  return toMealPlanDto(plan);
}

export async function listMealPlansForPatient(
  nutritionistId: string,
  patientId: string,
): Promise<MealPlanDto[]> {
  await assertPatientManagedByNutritionist(nutritionistId, patientId);

  const plans = await prisma.mealPlan.findMany({
    where: {
      patientId,
      nutritionistId,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: mealPlanSelect,
  });

  return plans.map(toMealPlanDto);
}

export async function getMealPlanById(
  nutritionistId: string,
  mealPlanId: string,
): Promise<MealPlanWithMealsDto> {
  const plan = await getManagedMealPlanRecord(nutritionistId, mealPlanId);

  return toMealPlanWithMealsDto(plan);
}

export async function updateMealPlan(
  nutritionistId: string,
  mealPlanId: string,
  input: UpdateMealPlanInput,
): Promise<MealPlanDto> {
  const plan = await getManagedMealPlanRecord(nutritionistId, mealPlanId);

  if (input.isActive === true) {
    const updatedPlan = await prisma.$transaction(async (tx) => {
      await tx.mealPlan.updateMany({
        where: {
          patientId: plan.patientId,
          isActive: true,
          NOT: {
            id: mealPlanId,
          },
        },
        data: {
          isActive: false,
        },
      });

      return tx.mealPlan.update({
        where: { id: mealPlanId },
        data: {
          title: input.title,
          description:
            input.description !== undefined ? input.description : undefined,
          isActive: true,
        },
        select: mealPlanSelect,
      });
    });

    return toMealPlanDto(updatedPlan);
  }

  const updatedPlan = await prisma.mealPlan.update({
    where: { id: mealPlanId },
    data: {
      title: input.title,
      description:
        input.description !== undefined ? input.description : undefined,
      isActive: input.isActive,
    },
    select: mealPlanSelect,
  });

  return toMealPlanDto(updatedPlan);
}

export async function activateMealPlan(
  nutritionistId: string,
  mealPlanId: string,
): Promise<MealPlanDto> {
  const plan = await getManagedMealPlanRecord(nutritionistId, mealPlanId);

  const activePlan = await prisma.$transaction(async (tx) => {
    await tx.mealPlan.updateMany({
      where: {
        patientId: plan.patientId,
        isActive: true,
        NOT: {
          id: mealPlanId,
        },
      },
      data: {
        isActive: false,
      },
    });

    return tx.mealPlan.update({
      where: { id: mealPlanId },
      data: { isActive: true },
      select: mealPlanSelect,
    });
  });

  return toMealPlanDto(activePlan);
}

export async function deleteMealPlan(
  nutritionistId: string,
  mealPlanId: string,
): Promise<void> {
  await getManagedMealPlanRecord(nutritionistId, mealPlanId);

  await prisma.mealPlan.delete({
    where: { id: mealPlanId },
  });
}

export async function createMeal(
  nutritionistId: string,
  mealPlanId: string,
  input: CreateMealInput,
): Promise<MealDto> {
  await getManagedMealPlanRecord(nutritionistId, mealPlanId);

  const meal = await prisma.meal.create({
    data: {
      mealPlanId,
      name: input.name,
      description: input.description ?? null,
      scheduledTime: input.scheduledTime ?? null,
      order: input.order,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    },
    select: mealSelect,
  });

  return toMealDto(meal);
}

export async function updateMeal(
  nutritionistId: string,
  mealPlanId: string,
  mealId: string,
  input: UpdateMealInput,
): Promise<MealDto> {
  await getManagedMealPlanRecord(nutritionistId, mealPlanId);
  await assertMealBelongsToPlan(mealPlanId, mealId);

  const meal = await prisma.meal.update({
    where: { id: mealId },
    data: {
      name: input.name,
      description:
        input.description !== undefined ? input.description : undefined,
      scheduledTime:
        input.scheduledTime !== undefined ? input.scheduledTime : undefined,
      order: input.order,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    },
    select: mealSelect,
  });

  return toMealDto(meal);
}

export async function deleteMeal(
  nutritionistId: string,
  mealPlanId: string,
  mealId: string,
): Promise<void> {
  await getManagedMealPlanRecord(nutritionistId, mealPlanId);
  await assertMealBelongsToPlan(mealPlanId, mealId);

  await prisma.meal.delete({
    where: { id: mealId },
  });
}

export async function getActiveMealPlanForPatient(
  patientId: string,
): Promise<MealPlanWithMealsDto> {
  const plan = await prisma.mealPlan.findFirst({
    where: {
      patientId,
      isActive: true,
    },
    select: mealPlanWithMealsSelect,
  });

  if (!plan) {
    throw new AppError("Active meal plan not found.", 404);
  }

  return toMealPlanWithMealsDto(plan);
}

export async function getActiveMealsForPatient(
  patientId: string,
): Promise<MealDto[]> {
  const activePlan = await getActiveMealPlanForPatient(patientId);

  return activePlan.meals;
}

import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  CreateMacroGoalInput,
  MacroGoalDto,
  UpdateMacroGoalInput,
} from "./macro-goal.types";

const macroGoalSelect = {
  id: true,
  patientId: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
} as const;

export async function createMacroGoal(
  input: CreateMacroGoalInput,
): Promise<MacroGoalDto> {
  const patient = await prisma.user.findUnique({
    where: { id: input.patientId },
    select: { id: true, role: true },
  });

  if (!patient) {
    throw new AppError("Patient not found.", 404);
  }

  if (patient.role !== UserRole.PATIENT) {
    throw new AppError("Macro goals can only be assigned to patients.", 400);
  }

  const existingGoal = await prisma.macroGoal.findUnique({
    where: { patientId: input.patientId },
    select: { id: true },
  });

  if (existingGoal) {
    throw new AppError("Macro goal already exists for this patient.", 409);
  }

  return prisma.macroGoal.create({
    data: input,
    select: macroGoalSelect,
  });
}

export async function getMacroGoalByPatientId(
  patientId: string,
): Promise<MacroGoalDto> {
  const goal = await prisma.macroGoal.findUnique({
    where: { patientId },
    select: macroGoalSelect,
  });

  if (!goal) {
    throw new AppError("Macro goal not found.", 404);
  }

  return goal;
}

export async function updateMacroGoal(
  patientId: string,
  input: UpdateMacroGoalInput,
): Promise<MacroGoalDto> {
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { id: true, role: true },
  });

  if (!patient) {
    throw new AppError("Patient not found.", 404);
  }

  if (patient.role !== UserRole.PATIENT) {
    throw new AppError("Macro goals can only be assigned to patients.", 400);
  }

  const existingGoal = await prisma.macroGoal.findUnique({
    where: { patientId },
    select: { id: true },
  });

  if (!existingGoal) {
    throw new AppError("Macro goal not found.", 404);
  }

  return prisma.macroGoal.update({
    where: { patientId },
    data: input,
    select: macroGoalSelect,
  });
}

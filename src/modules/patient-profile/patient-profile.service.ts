import { UserRole } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  CreatePatientProfileInput,
  PatientProfileDto,
} from "./patient-profile.types";

const patientProfileSelect = {
  id: true,
  userId: true,
  nutritionistId: true,
} as const;

export async function createPatientProfile(
  input: CreatePatientProfileInput,
): Promise<PatientProfileDto> {
  const [patient, nutritionist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, role: true },
    }),
    prisma.user.findUnique({
      where: { id: input.nutritionistId },
      select: { id: true, role: true },
    }),
  ]);

  if (!patient || patient.role !== UserRole.PATIENT) {
    throw new AppError("Patient user not found.", 404);
  }

  if (!nutritionist || nutritionist.role !== UserRole.NUTRI) {
    throw new AppError("Nutritionist user not found.", 404);
  }

  return prisma.patientProfile.create({
    data: input,
    select: patientProfileSelect,
  });
}

export async function getPatientProfileByUserId(
  userId: string,
): Promise<PatientProfileDto | null> {
  return prisma.patientProfile.findUnique({
    where: { userId },
    select: patientProfileSelect,
  });
}

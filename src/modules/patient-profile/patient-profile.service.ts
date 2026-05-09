import { UserRole } from "@prisma/client";

import { hashPassword } from "@/lib/crypto";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

import type {
  CreateNutritionistPatientInput,
  CreatePatientProfileInput,
  CreatedNutritionistPatientDto,
  LinkedPatientDto,
  PatientProfileDto,
} from "./patient-profile.types";

const patientProfileSelect = {
  id: true,
  userId: true,
  nutritionistId: true,
} as const;

const linkedPatientSelect = {
  id: true,
  userId: true,
  nutritionistId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  },
} as const;

function toLinkedPatientDto(profile: {
  id: string;
  userId: string;
  nutritionistId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}): LinkedPatientDto {
  return {
    id: profile.id,
    userId: profile.userId,
    nutritionistId: profile.nutritionistId,
    patient: {
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      role: "PATIENT",
      createdAt: profile.user.createdAt,
    },
  };
}

async function assertNutritionistExists(nutritionistId: string): Promise<void> {
  const nutritionist = await prisma.user.findUnique({
    where: { id: nutritionistId },
    select: { id: true, role: true },
  });

  if (!nutritionist || nutritionist.role !== UserRole.NUTRI) {
    throw new AppError("Nutritionist user not found.", 404);
  }
}

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

export async function listPatientsForNutritionist(
  nutritionistId: string,
): Promise<LinkedPatientDto[]> {
  await assertNutritionistExists(nutritionistId);

  const profiles = await prisma.patientProfile.findMany({
    where: { nutritionistId },
    select: linkedPatientSelect,
  });

  return profiles
    .map(toLinkedPatientDto)
    .sort((left, right) => left.patient.name.localeCompare(right.patient.name));
}

export async function assertNutritionistCanAccessPatient(
  nutritionistId: string,
  patientId: string,
): Promise<void> {
  await assertNutritionistExists(nutritionistId);

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

export async function getLinkedPatientForNutritionist(
  nutritionistId: string,
  patientId: string,
): Promise<LinkedPatientDto> {
  await assertNutritionistCanAccessPatient(nutritionistId, patientId);

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: patientId },
    select: linkedPatientSelect,
  });

  if (!profile) {
    throw new AppError("Patient profile not found.", 404);
  }

  return toLinkedPatientDto(profile);
}

export async function createOrLinkPatientForNutritionist(
  nutritionistId: string,
  input: CreateNutritionistPatientInput,
): Promise<CreatedNutritionistPatientDto> {
  await assertNutritionistExists(nutritionistId);

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (existingUser) {
    if (existingUser.role !== UserRole.PATIENT) {
      throw new AppError(
        "A non-patient user already exists with this email.",
        409,
      );
    }

    const existingProfile = await prisma.patientProfile.findUnique({
      where: { userId: existingUser.id },
      select: patientProfileSelect,
    });

    if (existingProfile) {
      if (existingProfile.nutritionistId === nutritionistId) {
        throw new AppError(
          "Patient is already linked to this nutritionist.",
          409,
        );
      }

      throw new AppError("Patient is already linked to another nutritionist.", 409);
    }

    const password = await hashPassword(input.password);
    const updatedPatient = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: input.name,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const profile = await prisma.patientProfile.create({
      data: {
        userId: existingUser.id,
        nutritionistId,
      },
      select: patientProfileSelect,
    });

    return {
      patient: {
        id: updatedPatient.id,
        name: updatedPatient.name,
        email: updatedPatient.email,
        role: "PATIENT",
        createdAt: updatedPatient.createdAt,
      },
      profile,
    };
  }

  const password = await hashPassword(input.password);
  const result = await prisma.$transaction(async (tx) => {
    const patient = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        role: UserRole.PATIENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const profile = await tx.patientProfile.create({
      data: {
        userId: patient.id,
        nutritionistId,
      },
      select: patientProfileSelect,
    });

    return { patient, profile };
  });

  return {
    patient: {
      id: result.patient.id,
      name: result.patient.name,
      email: result.patient.email,
      role: "PATIENT",
      createdAt: result.patient.createdAt,
    },
    profile: result.profile,
  };
}

import { z } from "zod";

export const createPatientProfileSchema = z.object({
  userId: z.string().trim().min(1),
  nutritionistId: z.string().trim().min(1),
});

export const createNutritionistPatientSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type CreatePatientProfileInput = z.infer<typeof createPatientProfileSchema>;
export type CreateNutritionistPatientInput = z.infer<
  typeof createNutritionistPatientSchema
>;

export type PatientProfileDto = {
  id: string;
  userId: string;
  nutritionistId: string;
};

export type PatientNutritionistSummaryDto = {
  nutritionist: {
    id: string;
    name: string;
  } | null;
};

export type LinkedPatientDto = {
  id: string;
  userId: string;
  nutritionistId: string;
  patient: {
    id: string;
    name: string;
    email: string;
    role: "PATIENT";
    createdAt: Date;
  };
};

export type CreatedNutritionistPatientDto = {
  patient: LinkedPatientDto["patient"];
  profile: PatientProfileDto;
};

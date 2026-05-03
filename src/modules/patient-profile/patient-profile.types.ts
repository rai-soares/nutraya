import { z } from "zod";

export const createPatientProfileSchema = z.object({
  userId: z.string().trim().min(1),
  nutritionistId: z.string().trim().min(1),
});

export type CreatePatientProfileInput = z.infer<typeof createPatientProfileSchema>;

export type PatientProfileDto = {
  id: string;
  userId: string;
  nutritionistId: string;
};

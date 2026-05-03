import { z } from "zod";

export const createMacroGoalSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
});

export type CreateMacroGoalInput = z.infer<typeof createMacroGoalSchema>;

export type MacroGoalDto = {
  id: string;
  patientId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

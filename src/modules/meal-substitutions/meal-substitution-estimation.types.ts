import { z } from "zod";

const APPROXIMATE_DISCLAIMER =
  "Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.";

function appendApproximateDisclaimer(notes: string): string {
  if (/approx/i.test(notes) && /hidden ingredients|oils|sauces/i.test(notes)) {
    return notes;
  }

  const normalizedNotes = notes.trim();

  if (!normalizedNotes) {
    return APPROXIMATE_DISCLAIMER;
  }

  return `${normalizedNotes} ${APPROXIMATE_DISCLAIMER}`;
}

export const mealMacroConfidenceSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const mealMacroEstimationResultSchema = z
  .object({
    identifiedFoods: z.array(z.string().trim().min(1)).default([]),
    portionEstimate: z.string().trim().min(1),
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    confidence: mealMacroConfidenceSchema,
    notes: z.string().trim().min(1),
  })
  .transform((value) => ({
    identifiedFoods: value.identifiedFoods.map((food) => food.trim()),
    portionEstimate: value.portionEstimate.trim(),
    calories: Math.round(value.calories),
    protein: Math.round(value.protein),
    carbs: Math.round(value.carbs),
    fat: Math.round(value.fat),
    confidence: value.confidence,
    notes: appendApproximateDisclaimer(value.notes),
  }));

export const mealMacroEstimationResponseSchema = {
  type: "object",
  description:
    "Approximate macro estimation for a meal photo, including foods, portions, macros, confidence, and an approximation disclaimer.",
  additionalProperties: false,
  required: [
    "identifiedFoods",
    "portionEstimate",
    "calories",
    "protein",
    "carbs",
    "fat",
    "confidence",
    "notes",
  ],
  properties: {
    identifiedFoods: {
      type: "array",
      items: {
        type: "string",
      },
    },
    portionEstimate: {
      type: "string",
    },
    calories: {
      type: "number",
    },
    protein: {
      type: "number",
    },
    carbs: {
      type: "number",
    },
    fat: {
      type: "number",
    },
    confidence: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    notes: {
      type: "string",
    },
  },
};

export type MealMacroEstimationResult = z.infer<
  typeof mealMacroEstimationResultSchema
>;

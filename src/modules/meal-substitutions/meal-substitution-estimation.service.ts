import { createStructuredImageResponse } from "@/modules/gemini/gemini.service";

import {
  mealMacroEstimationResponseSchema,
  mealMacroEstimationResultSchema,
  type MealMacroEstimationResult,
} from "./meal-substitution-estimation.types";

const estimationInstructions = [
  "Estimate meal macros from the visible meal image and return JSON only.",
  "Identify only foods that are visible in the image.",
  "Estimate portions conservatively and keep all values approximate.",
  "Do not invent hidden ingredients or foods outside the visible plate.",
  "If uncertainty is meaningful, set confidence to LOW.",
  "Mention that oils, sauces, preparation method, and hidden ingredients may affect accuracy.",
  "Return non-negative values for calories, protein, carbs, and fat.",
].join(" ");

export async function estimateMealPhotoMacros(
  imageUrl: string,
): Promise<MealMacroEstimationResult> {
  const structuredOutput = await createStructuredImageResponse({
    imageUrl,
    instructions: estimationInstructions,
    responseSchema: mealMacroEstimationResponseSchema,
  });

  const parsed = JSON.parse(structuredOutput) as unknown;

  return mealMacroEstimationResultSchema.parse(parsed);
}

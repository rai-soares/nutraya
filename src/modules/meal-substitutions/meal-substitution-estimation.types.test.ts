import { describe, expect, it } from "vitest";

import { mealMacroEstimationResultSchema } from "@/modules/meal-substitutions/meal-substitution-estimation.types";

describe("meal substitution estimation types", () => {
  it("normalizes a valid estimation payload and appends the disclaimer", () => {
    const result = mealMacroEstimationResultSchema.parse({
      identifiedFoods: ["rice", " chicken "],
      portionEstimate: "One medium plate",
      calories: 619.7,
      protein: 41.6,
      carbs: 68.2,
      fat: 18.1,
      confidence: "MEDIUM",
      notes: "Visible foods only.",
    });

    expect(result).toEqual({
      identifiedFoods: ["rice", "chicken"],
      portionEstimate: "One medium plate",
      calories: 620,
      protein: 42,
      carbs: 68,
      fat: 18,
      confidence: "MEDIUM",
      notes:
        "Visible foods only. Approximate estimate based on visible foods. Oils, sauces, preparation method and hidden ingredients may affect accuracy.",
    });
  });

  it("rejects invalid confidence values", () => {
    expect(() =>
      mealMacroEstimationResultSchema.parse({
        identifiedFoods: ["rice"],
        portionEstimate: "Plate",
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 10,
        confidence: "SURE",
        notes: "Approximate values.",
      }),
    ).toThrow();
  });
});

import { describe, expect, it } from "vitest";

import {
  mealSubstitutionEstimateMacrosBodySchema,
  nutritionistMealSubstitutionQuerySchema,
  nutritionistMealSubstitutionFeedbackBodySchema,
  patientMealSubstitutionBodySchema,
} from "@/modules/meal-substitutions/meal-substitution.types";

describe("meal substitution types", () => {
  it("accepts a patient substitution payload with an optional note", () => {
    const result = patientMealSubstitutionBodySchema.parse({
      mealId: "meal-1",
      imageUrl: "https://cdn.example.com/meal.jpg",
      note: "Can I switch this lunch?",
    });

    expect(result.note).toBe("Can I switch this lunch?");
  });

  it("rejects an invalid image URL", () => {
    expect(() =>
      patientMealSubstitutionBodySchema.parse({
        mealId: "meal-1",
        imageUrl: "not-a-url",
      }),
    ).toThrow("Image URL must be a valid URL.");
  });

  it("accepts an empty nutritionist feedback payload", () => {
    const result = nutritionistMealSubstitutionFeedbackBodySchema.parse({});

    expect(result.nutritionistFeedback).toBeUndefined();
  });

  it("accepts an optional patientId filter for nutritionist listing", () => {
    const result = nutritionistMealSubstitutionQuerySchema.parse({
      patientId: "patient-1",
    });

    expect(result.patientId).toBe("patient-1");
  });

  it("accepts an optional force flag for macro estimation", () => {
    const result = mealSubstitutionEstimateMacrosBodySchema.parse({
      force: true,
    });

    expect(result.force).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  mealCompletionBodySchema,
  mealCompletionQuerySchema,
} from "@/modules/meal-completions/meal-completion.types";

describe("meal completion types", () => {
  it("accepts a valid completion body", () => {
    const result = mealCompletionBodySchema.parse({
      mealId: "meal-1",
      date: "2026-05-09",
    });

    expect(result.mealId).toBe("meal-1");
  });

  it("rejects an invalid completion body", () => {
    expect(() =>
      mealCompletionBodySchema.parse({
        mealId: "",
        date: "09-05-2026",
      }),
    ).toThrow();
  });

  it("accepts a valid completion date query", () => {
    const result = mealCompletionQuerySchema.parse({
      date: "2026-05-09",
    });

    expect(result.date).toBe("2026-05-09");
  });
});

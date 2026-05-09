import { describe, expect, it } from "vitest";

import {
  createMacroGoalSchema,
  updateMacroGoalSchema,
} from "@/modules/macro-goals/macro-goal.types";

describe("createMacroGoalSchema", () => {
  it("accepts a valid macro goal payload", () => {
    const result = createMacroGoalSchema.parse({
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    expect(result.patientId).toBe("patient-1");
  });

  it("rejects negative values", () => {
    const result = createMacroGoalSchema.safeParse({
      patientId: "patient-1",
      calories: -1,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    expect(result.success).toBe(false);
  });
});

describe("updateMacroGoalSchema", () => {
  it("accepts a valid update payload", () => {
    const result = updateMacroGoalSchema.parse({
      calories: 2100,
      protein: 130,
      carbs: 230,
      fat: 65,
    });

    expect(result.calories).toBe(2100);
  });
});

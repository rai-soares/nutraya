import { describe, expect, it } from "vitest";

import {
  createMealPlanSchema,
  createMealSchema,
  updateMealPlanSchema,
  updateMealSchema,
} from "@/modules/meal-plans/meal-plan.types";

describe("meal plan types", () => {
  it("accepts a valid meal plan payload", () => {
    const result = createMealPlanSchema.parse({
      patientId: "patient-1",
      title: "Cutting Plan",
      description: "Weekday plan",
      isActive: true,
    });

    expect(result.title).toBe("Cutting Plan");
    expect(result.isActive).toBe(true);
  });

  it("rejects an empty meal plan title", () => {
    expect(() =>
      createMealPlanSchema.parse({
        patientId: "patient-1",
        title: "",
      }),
    ).toThrow();
  });

  it("requires at least one field to update a meal plan", () => {
    expect(() => updateMealPlanSchema.parse({})).toThrow();
  });

  it("accepts a valid meal payload", () => {
    const result = createMealSchema.parse({
      name: "Breakfast",
      scheduledTime: "07:30",
      order: 0,
      calories: 450,
      protein: 30,
      carbs: 45,
      fat: 12,
    });

    expect(result.name).toBe("Breakfast");
  });

  it("rejects invalid meal payload values", () => {
    expect(() =>
      createMealSchema.parse({
        name: "",
        scheduledTime: "7:30",
        order: -1,
        calories: -1,
        protein: 20,
        carbs: 30,
        fat: 10,
      }),
    ).toThrow();
  });

  it("requires at least one field to update a meal", () => {
    expect(() => updateMealSchema.parse({})).toThrow();
  });
});

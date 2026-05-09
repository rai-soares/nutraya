import { describe, expect, it } from "vitest";

import {
  createNutritionistPatientSchema,
  createPatientProfileSchema,
} from "@/modules/patient-profile/patient-profile.types";

describe("createPatientProfileSchema", () => {
  it("accepts valid ids", () => {
    const result = createPatientProfileSchema.parse({
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    expect(result).toEqual({
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });
  });

  it("rejects empty ids", () => {
    const result = createPatientProfileSchema.safeParse({
      userId: "",
      nutritionistId: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("createNutritionistPatientSchema", () => {
  it("accepts a valid patient onboarding payload", () => {
    const result = createNutritionistPatientSchema.parse({
      name: "Ana Costa",
      email: "ANA@EXAMPLE.COM",
      password: "secret123",
    });

    expect(result).toEqual({
      name: "Ana Costa",
      email: "ana@example.com",
      password: "secret123",
    });
  });

  it("rejects short passwords", () => {
    const result = createNutritionistPatientSchema.safeParse({
      name: "Ana Costa",
      email: "ana@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
  });
});

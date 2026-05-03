import { describe, expect, it } from "vitest";

import { createPatientProfileSchema } from "@/modules/patient-profile/patient-profile.types";

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

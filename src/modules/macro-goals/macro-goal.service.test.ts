import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createMacroGoal,
  getMacroGoalByPatientId,
} from "@/modules/macro-goals/macro-goal.service";

describe("macro goal service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a macro goal for an existing patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue(null);
    prismaMock.macroGoal.create.mockResolvedValue({
      id: "goal-1",
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    const result = await createMacroGoal({
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    expect(prismaMock.macroGoal.create).toHaveBeenCalledWith({
      data: {
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      },
      select: {
        id: true,
        patientId: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });
    expect(result.id).toBe("goal-1");
  });

  it("fails when the patient does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      createMacroGoal({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
    ).rejects.toMatchObject({
      message: "Patient not found.",
      statusCode: 404,
    });
  });

  it("fails when the target user is not a patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.NUTRI,
    });

    await expect(
      createMacroGoal({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
    ).rejects.toMatchObject({
      message: "Macro goals can only be assigned to patients.",
      statusCode: 400,
    });
  });

  it("fails when a macro goal already exists for the patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.macroGoal.findUnique.mockResolvedValue({ id: "goal-1" });

    await expect(
      createMacroGoal({
        patientId: "patient-1",
        calories: 2000,
        protein: 120,
        carbs: 220,
        fat: 60,
      }),
    ).rejects.toMatchObject({
      message: "Macro goal already exists for this patient.",
      statusCode: 409,
    });
  });

  it("returns a macro goal by patient id", async () => {
    prismaMock.macroGoal.findUnique.mockResolvedValue({
      id: "goal-1",
      patientId: "patient-1",
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 60,
    });

    const result = await getMacroGoalByPatientId("patient-1");

    expect(prismaMock.macroGoal.findUnique).toHaveBeenCalledWith({
      where: { patientId: "patient-1" },
      select: {
        id: true,
        patientId: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });
    expect(result.id).toBe("goal-1");
  });

  it("fails when no macro goal exists for the patient", async () => {
    prismaMock.macroGoal.findUnique.mockResolvedValue(null);

    await expect(getMacroGoalByPatientId("patient-1")).rejects.toMatchObject({
      message: "Macro goal not found.",
      statusCode: 404,
    });
  });
});

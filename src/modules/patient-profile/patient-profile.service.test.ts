import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createPatientProfile,
  getPatientProfileByUserId,
} from "@/modules/patient-profile/patient-profile.service";

describe("patient profile service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a patient profile when patient and nutritionist roles are valid", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "patient-1", role: UserRole.PATIENT })
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI });
    prismaMock.patientProfile.create.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    const result = await createPatientProfile({
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    expect(prismaMock.patientProfile.create).toHaveBeenCalledWith({
      data: {
        userId: "patient-1",
        nutritionistId: "nutri-1",
      },
      select: {
        id: true,
        userId: true,
        nutritionistId: true,
      },
    });
    expect(result.id).toBe("profile-1");
  });

  it("rejects creation when the patient user is missing or invalid", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "patient-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI });

    await expect(
      createPatientProfile({
        userId: "patient-1",
        nutritionistId: "nutri-1",
      }),
    ).rejects.toMatchObject({
      message: "Patient user not found.",
      statusCode: 404,
    });
  });

  it("rejects creation when the nutritionist user is missing or invalid", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "patient-1", role: UserRole.PATIENT })
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.PATIENT });

    await expect(
      createPatientProfile({
        userId: "patient-1",
        nutritionistId: "nutri-1",
      }),
    ).rejects.toMatchObject({
      message: "Nutritionist user not found.",
      statusCode: 404,
    });
  });

  it("retrieves a patient profile by user id", async () => {
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    const result = await getPatientProfileByUserId("patient-1");

    expect(prismaMock.patientProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "patient-1" },
      select: {
        id: true,
        userId: true,
        nutritionistId: true,
      },
    });
    expect(result?.id).toBe("profile-1");
  });
});

import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

const { hashPasswordMock } = vi.hoisted(() => ({
  hashPasswordMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/crypto", () => ({
  hashPassword: hashPasswordMock,
}));

import {
  assertNutritionistCanAccessPatient,
  createOrLinkPatientForNutritionist,
  createPatientProfile,
  getLinkedPatientForNutritionist,
  getPatientProfileByUserId,
  listPatientsForNutritionist,
} from "@/modules/patient-profile/patient-profile.service";

describe("patient profile service", () => {
  beforeEach(() => {
    resetPrismaMock();
    hashPasswordMock.mockReset();
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

  it("lists linked patients for a nutritionist", async () => {
    const createdAt = new Date("2026-05-09T10:00:00.000Z");

    prismaMock.user.findUnique.mockResolvedValue({
      id: "nutri-1",
      role: UserRole.NUTRI,
    });
    prismaMock.patientProfile.findMany.mockResolvedValue([
      {
        id: "profile-2",
        userId: "patient-2",
        nutritionistId: "nutri-1",
        user: {
          id: "patient-2",
          name: "Bruna Silva",
          email: "bruna@example.com",
          role: UserRole.PATIENT,
          createdAt,
        },
      },
      {
        id: "profile-1",
        userId: "patient-1",
        nutritionistId: "nutri-1",
        user: {
          id: "patient-1",
          name: "Ana Costa",
          email: "ana@example.com",
          role: UserRole.PATIENT,
          createdAt,
        },
      },
    ]);

    const result = await listPatientsForNutritionist("nutri-1");

    expect(prismaMock.patientProfile.findMany).toHaveBeenCalledWith({
      where: { nutritionistId: "nutri-1" },
      select: {
        id: true,
        userId: true,
        nutritionistId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
    expect(result.map((item) => item.patient.name)).toEqual([
      "Ana Costa",
      "Bruna Silva",
    ]);
  });

  it("allows a nutritionist to access a linked patient", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce({ id: "patient-1", role: UserRole.PATIENT });
    prismaMock.patientProfile.findUnique
      .mockResolvedValueOnce({ nutritionistId: "nutri-1" })
      .mockResolvedValueOnce({
        id: "profile-1",
        userId: "patient-1",
        nutritionistId: "nutri-1",
        user: {
          id: "patient-1",
          name: "Ana Costa",
          email: "ana@example.com",
          role: UserRole.PATIENT,
          createdAt: new Date("2026-05-09T10:00:00.000Z"),
        },
      });

    const result = await getLinkedPatientForNutritionist("nutri-1", "patient-1");

    expect(result.patient.email).toBe("ana@example.com");
  });

  it("blocks a nutritionist from accessing an unlinked patient", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce({ id: "patient-1", role: UserRole.PATIENT });
    prismaMock.patientProfile.findUnique.mockResolvedValueOnce({
      nutritionistId: "nutri-2",
    });

    await expect(
      assertNutritionistCanAccessPatient("nutri-1", "patient-1"),
    ).rejects.toMatchObject({
      message: "Patient is not linked to this nutritionist.",
      statusCode: 403,
    });
  });

  it("creates and links a brand new patient for a nutritionist", async () => {
    const createdAt = new Date("2026-05-09T10:00:00.000Z");

    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce(null);
    hashPasswordMock.mockResolvedValue("hashed-password");
    prismaMock.user.create.mockResolvedValue({
      id: "patient-1",
      name: "Ana Costa",
      email: "ana@example.com",
      role: UserRole.PATIENT,
      createdAt,
    });
    prismaMock.patientProfile.create.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    const result = await createOrLinkPatientForNutritionist("nutri-1", {
      name: "Ana Costa",
      email: "ana@example.com",
      password: "secret123",
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("secret123");
    expect(result.profile.userId).toBe("patient-1");
    expect(result.patient.role).toBe("PATIENT");
  });

  it("links an existing patient with no profile", async () => {
    const createdAt = new Date("2026-05-09T10:00:00.000Z");

    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce({
        id: "patient-1",
        name: "Ana Costa",
        email: "ana@example.com",
        role: UserRole.PATIENT,
        createdAt,
      });
    hashPasswordMock.mockResolvedValue("hashed-password");
    prismaMock.patientProfile.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.update.mockResolvedValue({
      id: "patient-1",
      name: "Updated Name",
      email: "ana@example.com",
      role: UserRole.PATIENT,
      createdAt,
    });
    prismaMock.patientProfile.create.mockResolvedValue({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-1",
    });

    const result = await createOrLinkPatientForNutritionist("nutri-1", {
      name: "Ignored Name",
      email: "ana@example.com",
      password: "secret123",
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("secret123");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "patient-1" },
      data: {
        name: "Ignored Name",
        password: "hashed-password",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    expect(result.patient.name).toBe("Updated Name");
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
  });

  it("rejects linking when a patient is already assigned", async () => {
    const createdAt = new Date("2026-05-09T10:00:00.000Z");

    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: "nutri-1", role: UserRole.NUTRI })
      .mockResolvedValueOnce({
        id: "patient-1",
        name: "Ana Costa",
        email: "ana@example.com",
        role: UserRole.PATIENT,
        createdAt,
      });
    prismaMock.patientProfile.findUnique.mockResolvedValueOnce({
      id: "profile-1",
      userId: "patient-1",
      nutritionistId: "nutri-2",
    });

    await expect(
      createOrLinkPatientForNutritionist("nutri-1", {
        name: "Ana Costa",
        email: "ana@example.com",
        password: "secret123",
      }),
    ).rejects.toMatchObject({
      message: "Patient is already linked to another nutritionist.",
      statusCode: 409,
    });
  });
});

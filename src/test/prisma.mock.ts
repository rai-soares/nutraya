import { vi } from "vitest";

export const prismaMock = {
  user: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  patientProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  macroGoal: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

export function resetPrismaMock() {
  prismaMock.user.create.mockReset();
  prismaMock.user.findMany.mockReset();
  prismaMock.user.findUnique.mockReset();
  prismaMock.patientProfile.create.mockReset();
  prismaMock.patientProfile.findUnique.mockReset();
  prismaMock.macroGoal.create.mockReset();
  prismaMock.macroGoal.findUnique.mockReset();
}

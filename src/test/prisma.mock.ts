import { vi } from "vitest";

export const prismaMock = {
  $transaction: vi.fn(async (callback) => callback(prismaMock)),
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
  dailyMacroLog: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  mealPlan: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  meal: {
    create: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

export function resetPrismaMock() {
  prismaMock.$transaction.mockReset();
  prismaMock.$transaction.mockImplementation(async (callback) =>
    callback(prismaMock),
  );
  prismaMock.user.create.mockReset();
  prismaMock.user.findMany.mockReset();
  prismaMock.user.findUnique.mockReset();
  prismaMock.patientProfile.create.mockReset();
  prismaMock.patientProfile.findUnique.mockReset();
  prismaMock.macroGoal.create.mockReset();
  prismaMock.macroGoal.findUnique.mockReset();
  prismaMock.dailyMacroLog.findUnique.mockReset();
  prismaMock.dailyMacroLog.upsert.mockReset();
  prismaMock.mealPlan.create.mockReset();
  prismaMock.mealPlan.delete.mockReset();
  prismaMock.mealPlan.findFirst.mockReset();
  prismaMock.mealPlan.findMany.mockReset();
  prismaMock.mealPlan.findUnique.mockReset();
  prismaMock.mealPlan.update.mockReset();
  prismaMock.mealPlan.updateMany.mockReset();
  prismaMock.meal.create.mockReset();
  prismaMock.meal.delete.mockReset();
  prismaMock.meal.findUnique.mockReset();
  prismaMock.meal.update.mockReset();
}

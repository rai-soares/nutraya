import { vi } from "vitest";

export const prismaMock = {
  $transaction: vi.fn(async (callback) => callback(prismaMock)),
  user: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  patientProfile: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  macroGoal: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  dailyMacroLog: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
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
  mealCompletion: {
    createMany: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  conversation: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  message: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  mealSubstitution: {
    create: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
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
  prismaMock.user.update.mockReset();
  prismaMock.patientProfile.create.mockReset();
  prismaMock.patientProfile.findMany.mockReset();
  prismaMock.patientProfile.findUnique.mockReset();
  prismaMock.macroGoal.create.mockReset();
  prismaMock.macroGoal.findUnique.mockReset();
  prismaMock.macroGoal.update.mockReset();
  prismaMock.dailyMacroLog.create.mockReset();
  prismaMock.dailyMacroLog.findUnique.mockReset();
  prismaMock.dailyMacroLog.update.mockReset();
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
  prismaMock.mealCompletion.createMany.mockReset();
  prismaMock.mealCompletion.delete.mockReset();
  prismaMock.mealCompletion.findMany.mockReset();
  prismaMock.mealCompletion.findUnique.mockReset();
  prismaMock.conversation.create.mockReset();
  prismaMock.conversation.findUnique.mockReset();
  prismaMock.conversation.update.mockReset();
  prismaMock.message.count.mockReset();
  prismaMock.message.create.mockReset();
  prismaMock.message.findMany.mockReset();
  prismaMock.message.updateMany.mockReset();
  prismaMock.mealSubstitution.create.mockReset();
  prismaMock.mealSubstitution.delete.mockReset();
  prismaMock.mealSubstitution.findMany.mockReset();
  prismaMock.mealSubstitution.findUnique.mockReset();
  prismaMock.mealSubstitution.update.mockReset();
  prismaMock.mealSubstitution.updateMany.mockReset();
}

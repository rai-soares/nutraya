import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock, resetPrismaMock } from "@/test/prisma.mock";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  activateMealPlan,
  createMeal,
  createMealPlan,
  deleteMeal,
  deleteMealPlan,
  getActiveMealPlanForPatient,
  getActiveMealsForPatient,
  getMealPlanById,
  listMealPlansForPatient,
  updateMeal,
  updateMealPlan,
} from "@/modules/meal-plans/meal-plan.service";

const createdAt = new Date("2026-05-09T12:00:00.000Z");
const updatedAt = new Date("2026-05-09T12:30:00.000Z");

describe("meal plan service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates an active meal plan and deactivates previous ones", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.mealPlan.create.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
    });

    const result = await createMealPlan("nutri-1", {
      patientId: "patient-1",
      title: "Plan A",
      isActive: true,
    });

    expect(prismaMock.mealPlan.updateMany).toHaveBeenCalledWith({
      where: {
        patientId: "patient-1",
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    expect(result.isActive).toBe(true);
  });

  it("fails when the patient is not linked to the nutritionist", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-2",
    });

    await expect(
      createMealPlan("nutri-1", {
        patientId: "patient-1",
        title: "Plan A",
        isActive: false,
      }),
    ).rejects.toMatchObject({
      message: "Patient is not linked to this nutritionist.",
      statusCode: 403,
    });
  });

  it("lists meal plans for a linked patient", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "patient-1",
      role: UserRole.PATIENT,
    });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      nutritionistId: "nutri-1",
    });
    prismaMock.mealPlan.findMany.mockResolvedValue([
      {
        id: "plan-1",
        patientId: "patient-1",
        nutritionistId: "nutri-1",
        title: "Plan A",
        description: null,
        isActive: true,
        createdAt,
        updatedAt,
      },
    ]);

    const result = await listMealPlansForPatient("nutri-1", "patient-1");

    expect(result).toHaveLength(1);
    expect(prismaMock.mealPlan.findMany).toHaveBeenCalled();
  });

  it("returns a managed meal plan with ordered meals", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [
        {
          id: "meal-1",
          mealPlanId: "plan-1",
          name: "Breakfast",
          description: null,
          scheduledTime: "07:30",
          order: 0,
          calories: 400,
          protein: 30,
          carbs: 45,
          fat: 10,
          createdAt,
          updatedAt,
        },
      ],
    });

    const result = await getMealPlanById("nutri-1", "plan-1");

    expect(result.meals[0]?.name).toBe("Breakfast");
  });

  it("activates a meal plan and deactivates sibling plans", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: false,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.mealPlan.update.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
    });

    const result = await activateMealPlan("nutri-1", "plan-1");

    expect(prismaMock.mealPlan.updateMany).toHaveBeenCalledWith({
      where: {
        patientId: "patient-1",
        isActive: true,
        NOT: {
          id: "plan-1",
        },
      },
      data: {
        isActive: false,
      },
    });
    expect(result.isActive).toBe(true);
  });

  it("updates a meal plan and can deactivate it", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.mealPlan.update.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Updated Plan",
      description: "Updated",
      isActive: false,
      createdAt,
      updatedAt,
    });

    const result = await updateMealPlan("nutri-1", "plan-1", {
      title: "Updated Plan",
      description: "Updated",
      isActive: false,
    });

    expect(result.isActive).toBe(false);
    expect(result.title).toBe("Updated Plan");
  });

  it("creates a meal for a managed meal plan", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.meal.create.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
      name: "Lunch",
      description: null,
      scheduledTime: "12:00",
      order: 2,
      calories: 650,
      protein: 40,
      carbs: 70,
      fat: 18,
      createdAt,
      updatedAt,
    });

    const result = await createMeal("nutri-1", "plan-1", {
      name: "Lunch",
      scheduledTime: "12:00",
      order: 2,
      calories: 650,
      protein: 40,
      carbs: 70,
      fat: 18,
    });

    expect(result.mealPlanId).toBe("plan-1");
  });

  it("updates a meal when it belongs to the meal plan", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
    });
    prismaMock.meal.update.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
      name: "Lunch",
      description: "Updated",
      scheduledTime: "12:30",
      order: 2,
      calories: 700,
      protein: 45,
      carbs: 75,
      fat: 20,
      createdAt,
      updatedAt,
    });

    const result = await updateMeal("nutri-1", "plan-1", "meal-1", {
      description: "Updated",
      scheduledTime: "12:30",
      calories: 700,
      protein: 45,
      carbs: 75,
      fat: 20,
    });

    expect(result.calories).toBe(700);
  });

  it("fails when the meal belongs to another meal plan", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-2",
    });

    await expect(
      updateMeal("nutri-1", "plan-1", "meal-1", {
        calories: 700,
      }),
    ).rejects.toMatchObject({
      message: "Meal does not belong to this meal plan.",
      statusCode: 400,
    });
  });

  it("deletes a meal plan", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });

    await deleteMealPlan("nutri-1", "plan-1");

    expect(prismaMock.mealPlan.delete).toHaveBeenCalledWith({
      where: { id: "plan-1" },
    });
  });

  it("deletes a meal", async () => {
    prismaMock.mealPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });
    prismaMock.meal.findUnique.mockResolvedValue({
      id: "meal-1",
      mealPlanId: "plan-1",
    });

    await deleteMeal("nutri-1", "plan-1", "meal-1");

    expect(prismaMock.meal.delete).toHaveBeenCalledWith({
      where: { id: "meal-1" },
    });
  });

  it("returns the active meal plan for a patient", async () => {
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [],
    });

    const result = await getActiveMealPlanForPatient("patient-1");

    expect(result.id).toBe("plan-1");
  });

  it("returns ordered meals from the active meal plan", async () => {
    prismaMock.mealPlan.findFirst.mockResolvedValue({
      id: "plan-1",
      patientId: "patient-1",
      nutritionistId: "nutri-1",
      title: "Plan A",
      description: null,
      isActive: true,
      createdAt,
      updatedAt,
      meals: [
        {
          id: "meal-1",
          mealPlanId: "plan-1",
          name: "Breakfast",
          description: null,
          scheduledTime: "07:30",
          order: 0,
          calories: 400,
          protein: 30,
          carbs: 45,
          fat: 10,
          createdAt,
          updatedAt,
        },
      ],
    });

    const result = await getActiveMealsForPatient("patient-1");

    expect(result[0]?.order).toBe(0);
  });
});

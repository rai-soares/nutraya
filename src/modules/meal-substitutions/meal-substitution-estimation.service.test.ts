import { beforeEach, describe, expect, it, vi } from "vitest";

const { createStructuredImageResponseMock } = vi.hoisted(() => ({
  createStructuredImageResponseMock: vi.fn(),
}));

vi.mock("@/modules/gemini/gemini.service", () => ({
  createStructuredImageResponse: createStructuredImageResponseMock,
}));

import { estimateMealPhotoMacros } from "@/modules/meal-substitutions/meal-substitution-estimation.service";

describe("meal substitution estimation service", () => {
  beforeEach(() => {
    createStructuredImageResponseMock.mockReset();
  });

  it("returns a normalized estimation object from structured output", async () => {
    createStructuredImageResponseMock.mockResolvedValue(
      JSON.stringify({
        identifiedFoods: ["rice", "grilled chicken"],
        portionEstimate: "One medium plate",
        calories: 620,
        protein: 42,
        carbs: 68,
        fat: 18,
        confidence: "MEDIUM",
        notes: "Approximate estimate based on visible foods.",
      }),
    );

    const result = await estimateMealPhotoMacros("https://cdn.example.com/meal.jpg");

    expect(createStructuredImageResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: "https://cdn.example.com/meal.jpg",
      }),
    );
    expect(result.confidence).toBe("MEDIUM");
    expect(result.notes).toMatch(/approximate/i);
    expect(result.notes).toMatch(/hidden ingredients/i);
  });

  it("rejects invalid structured output content", async () => {
    createStructuredImageResponseMock.mockResolvedValue(
      JSON.stringify({
        identifiedFoods: "rice",
        portionEstimate: "One plate",
        calories: -20,
        protein: 42,
        carbs: 68,
        fat: 18,
        confidence: "MEDIUM",
        notes: "Approximate estimate.",
      }),
    );

    await expect(
      estimateMealPhotoMacros("https://cdn.example.com/meal.jpg"),
    ).rejects.toThrow();
  });
});

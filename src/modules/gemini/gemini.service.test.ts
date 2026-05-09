import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock, generateContentMock, googleGenAIMock, apiErrorCtor } = vi.hoisted(() => {
  class FakeApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  class FakeGoogleGenAI {
    constructor(options: unknown) {
      void options;
      return {
        models: {
          generateContent: generateContentMock,
        },
      };
    }
  }

  return {
    fetchMock: vi.fn(),
    generateContentMock: vi.fn(),
    googleGenAIMock: FakeGoogleGenAI,
    apiErrorCtor: FakeApiError,
  };
});

vi.mock("@google/genai", () => ({
  ApiError: apiErrorCtor,
  GoogleGenAI: googleGenAIMock,
}));

import { AppError } from "@/lib/errors";
import { createStructuredImageResponse } from "@/modules/gemini/gemini.service";

describe("gemini service", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    generateContentMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "gemini-2.5-flash";
  });

  it("downloads the image and sends a structured Gemini request", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("image/jpeg"),
      },
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from("image-bytes")),
    });
    generateContentMock.mockResolvedValue({
      text: "{\"ok\":true}",
    });

    const result = await createStructuredImageResponse({
      imageUrl: "https://cdn.example.com/meal.jpg",
      instructions: "Estimate this meal.",
      responseSchema: {
        type: "object",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith("https://cdn.example.com/meal.jpg", {
      method: "GET",
      redirect: "follow",
    });
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
        config: expect.objectContaining({
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
          },
        }),
      }),
    );
    expect(result).toBe("{\"ok\":true}");
  });

  it("returns a controlled error when the image url cannot be reached", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      headers: {
        get: vi.fn().mockReturnValue("image/jpeg"),
      },
    });

    await expect(
      createStructuredImageResponse({
        imageUrl: "https://cdn.example.com/missing.jpg",
        instructions: "Estimate this meal.",
        responseSchema: {
          type: "object",
        },
      }),
    ).rejects.toEqual(
      new AppError("Meal image could not be accessed for estimation.", 400),
    );
  });

  it("returns a controlled error when Gemini rejects the credentials", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("image/jpeg"),
      },
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from("image-bytes")),
    });
    generateContentMock.mockRejectedValue(new apiErrorCtor("Bad key", 401));

    await expect(
      createStructuredImageResponse({
        imageUrl: "https://cdn.example.com/meal.jpg",
        instructions: "Estimate this meal.",
        responseSchema: {
          type: "object",
        },
      }),
    ).rejects.toEqual(
      new AppError(
        "Gemini request failed. Check the API key and model configuration.",
        502,
      ),
    );
  });
});

import { ApiError, GoogleGenAI } from "@google/genai";

import { AppError } from "@/lib/errors";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_REQUEST_TIMEOUT_MS = 15_000;

type GeminiResponseSchema = {
  type: string;
  description?: string;
  required?: string[];
  properties?: Record<string, unknown>;
  items?: Record<string, unknown>;
  enum?: string[];
  additionalProperties?: boolean;
};

type CreateStructuredImageResponseInput = {
  imageUrl: string;
  instructions: string;
  responseSchema: GeminiResponseSchema;
};

type GeminiConfig = {
  apiKey: string;
  model: string;
};

function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new AppError("Gemini configuration is incomplete.", 500);
  }

  return {
    apiKey,
    model,
  };
}

function assertValidImageUrl(imageUrl: string): URL {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new AppError("Meal image URL is invalid.", 400);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new AppError("Meal image URL is invalid.", 400);
  }

  return parsedUrl;
}

function sanitizeJsonText(text: string): string {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function fetchImageAsInlineData(imageUrl: string): Promise<{
  mimeType: string;
  data: string;
}> {
  assertValidImageUrl(imageUrl);

  let response: Response;

  try {
    response = await fetch(imageUrl, {
      method: "GET",
      redirect: "follow",
    });
  } catch {
    throw new AppError("Meal image could not be accessed for estimation.", 400);
  }

  if (!response.ok) {
    throw new AppError("Meal image could not be accessed for estimation.", 400);
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "";

  if (!mimeType.startsWith("image/")) {
    throw new AppError("Meal image is unsupported or empty.", 400);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  if (imageBuffer.length === 0) {
    throw new AppError("Meal image is unsupported or empty.", 400);
  }

  return {
    mimeType,
    data: imageBuffer.toString("base64"),
  };
}

export async function createStructuredImageResponse({
  imageUrl,
  instructions,
  responseSchema,
}: CreateStructuredImageResponseInput): Promise<string> {
  const config = getGeminiConfig();
  const imageData = await fetchImageAsInlineData(imageUrl);
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: config.model,
        contents: [
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            },
          },
          {
            text: instructions,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new AppError("AI estimation timed out. Please try again.", 504));
        }, GEMINI_REQUEST_TIMEOUT_MS);
      }),
    ]);

    const output = typeof response.text === "string" ? sanitizeJsonText(response.text) : "";

    if (!output) {
      throw new AppError("AI estimation returned an empty result.", 502);
    }

    return output;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        throw new AppError(
          "Gemini request failed. Check the API key and model configuration.",
          502,
        );
      }

      throw new AppError(error.message || "AI estimation is unavailable right now.", 502);
    }

    throw new AppError("AI estimation is unavailable right now.", 502);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

import { describe, expect, it } from "vitest";

import {
  patientConversationParamSchema,
  sendMessageSchema,
} from "@/modules/chat/chat.types";

describe("chat types", () => {
  it("accepts a valid send message payload", () => {
    const result = sendMessageSchema.parse({
      messageType: "TEXT",
      text: "Hello there",
    });

    expect(result.text).toBe("Hello there");
  });

  it("accepts a valid image message payload with optional caption", () => {
    const result = sendMessageSchema.parse({
      messageType: "IMAGE",
      imageUrl: "https://cdn.example.com/photo.jpg",
      text: "My lunch",
    });

    expect(result).toMatchObject({
      imageUrl: "https://cdn.example.com/photo.jpg",
      text: "My lunch",
    });
  });

  it("rejects blank message text", () => {
    expect(() =>
      sendMessageSchema.parse({
        messageType: "TEXT",
        text: "   ",
      }),
    ).toThrow("Message text is required.");
  });

  it("accepts a valid patientId route parameter", () => {
    const result = patientConversationParamSchema.parse({
      patientId: "patient-1",
    });

    expect(result.patientId).toBe("patient-1");
  });
});

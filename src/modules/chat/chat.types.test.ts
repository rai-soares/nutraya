import { describe, expect, it } from "vitest";

import {
  patientConversationParamSchema,
  sendMessageSchema,
} from "@/modules/chat/chat.types";

describe("chat types", () => {
  it("accepts a valid send message payload", () => {
    const result = sendMessageSchema.parse({
      text: "Hello there",
    });

    expect(result.text).toBe("Hello there");
  });

  it("rejects blank message text", () => {
    expect(() =>
      sendMessageSchema.parse({
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

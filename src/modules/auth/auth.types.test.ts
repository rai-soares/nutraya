import { describe, expect, it } from "vitest";

import { loginSchema } from "@/modules/auth/auth.types";

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.parse({
      email: "ana@mail.com",
      password: "123456",
    });

    expect(result.email).toBe("ana@mail.com");
  });

  it("normalizes email to lowercase and trimmed", () => {
    const result = loginSchema.parse({
      email: "ANA@Mail.COM",
      password: "123456",
    });

    expect(result.email).toBe("ana@mail.com");
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "ana@mail.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});

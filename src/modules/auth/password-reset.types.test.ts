import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/password-reset.types";

describe("password reset schemas", () => {
  it("normalizes the forgot password email", () => {
    const result = forgotPasswordSchema.parse({
      email: " ANA@MAIL.COM ",
    });

    expect(result.email).toBe("ana@mail.com");
  });

  it("requires a password with at least 6 characters for reset", () => {
    const result = resetPasswordSchema.safeParse({
      token: "token-123",
      password: "123",
    });

    expect(result.success).toBe(false);
  });
});

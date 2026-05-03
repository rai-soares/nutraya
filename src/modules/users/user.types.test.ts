import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { createUserSchema } from "@/modules/users/user.types";

describe("createUserSchema", () => {
  it("normalizes email and trims name", () => {
    const result = createUserSchema.parse({
      name: "  Ana  ",
      email: "ANA@MAIL.COM",
      password: "123456",
      role: UserRole.NUTRI,
    });

    expect(result).toEqual({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456",
      role: UserRole.NUTRI,
    });
  });

  it("rejects short passwords", () => {
    const result = createUserSchema.safeParse({
      name: "Ana",
      email: "ana@mail.com",
      password: "123",
      role: UserRole.PATIENT,
    });

    expect(result.success).toBe(false);
  });
});

import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { handleRouteError, jsonResponse } from "@/lib/http";

describe("http helpers", () => {
  it("returns a JSON response with the provided status", async () => {
    const response = jsonResponse({ ok: true }, 201);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("maps zod errors to status 400", async () => {
    const schema = z.object({
      name: z.string(),
    });

    const parseResult = schema.safeParse({});
    const response = handleRouteError(
      new ZodError(parseResult.success ? [] : parseResult.error.issues),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message: "Invalid request payload.",
    });
  });

  it("maps app errors to their own status codes", async () => {
    const response = handleRouteError(new AppError("Nope.", 409));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ message: "Nope." });
  });

  it("maps prisma unique constraint errors to status 409", async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Prisma.PrismaClientKnownRequestError & { code: string };

    error.code = "P2002";

    const response = handleRouteError(error);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "Resource already exists.",
    });
  });

  it("maps unexpected errors to status 500", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = handleRouteError(new Error("Boom"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Internal server error.",
    });

    consoleSpy.mockRestore();
  });
});

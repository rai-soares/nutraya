import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonResponse(
      {
        message: "Invalid request payload.",
        issues: error.flatten(),
      },
      400,
    );
  }

  if (error instanceof AppError) {
    return jsonResponse({ message: error.message }, error.statusCode);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return jsonResponse({ message: "Resource already exists." }, 409);
  }

  console.error(error);

  return jsonResponse({ message: "Internal server error." }, 500);
}

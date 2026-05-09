import type { ApiErrorResponse } from "@/modules/shared/types/api";

export class ApiClientError extends Error {
  status: number;
  issues?: unknown;

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message || "Request failed.");
    this.name = "ApiClientError";
    this.status = status;
    this.issues = body.issues;
  }
}

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
};

function isBodyInit(body: unknown): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    typeof body === "string" ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  );
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const body =
    options.body === undefined
      ? undefined
      : isBodyInit(options.body)
        ? options.body
        : JSON.stringify(options.body);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: body as BodyInit | undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;

  if (!response.ok) {
    throw new ApiClientError(response.status, {
      message: (data as ApiErrorResponse | null)?.message || "Request failed.",
      issues: (data as ApiErrorResponse | null)?.issues,
    });
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE", body }),
};

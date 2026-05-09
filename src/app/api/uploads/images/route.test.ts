import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const { requireAuthMock, uploadImageFileMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  uploadImageFileMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("@/modules/uploads/upload.service", () => ({
  uploadImageFile: uploadImageFileMock,
}));

import { POST } from "@/app/api/uploads/images/route";

describe("/api/uploads/images route", () => {
  beforeEach(() => {
    requireAuthMock.mockReset();
    uploadImageFileMock.mockReset();
    requireAuthMock.mockResolvedValue({ userId: "patient-1", role: "PATIENT" });
  });

  it("uploads an authenticated image file", async () => {
    uploadImageFileMock.mockResolvedValue({
      imageUrl: "https://cdn.example.com/photo.jpg",
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["binary"], "photo.jpg", { type: "image/jpeg" }),
    );

    const response = await POST(
      new Request("http://localhost/api/uploads/images", {
        method: "POST",
        body: formData,
      }),
    );

    expect(uploadImageFileMock).toHaveBeenCalled();
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      imageUrl: "https://cdn.example.com/photo.jpg",
    });
  });

  it("returns 400 when the file field is missing", async () => {
    uploadImageFileMock.mockImplementation(() => {
      throw new AppError("Image file is required.", 400);
    });

    const response = await POST(
      new Request("http://localhost/api/uploads/images", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(400);
    expect(uploadImageFileMock).toHaveBeenCalledWith(null);
  });
});

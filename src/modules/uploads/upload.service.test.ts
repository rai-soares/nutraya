import { beforeEach, describe, expect, it, vi } from "vitest";

const { cloudinaryConfigMock, uploadStreamMock } = vi.hoisted(() => ({
  cloudinaryConfigMock: vi.fn(),
  uploadStreamMock: vi.fn(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: cloudinaryConfigMock,
    uploader: {
      upload_stream: uploadStreamMock,
    },
  },
}));

import {
  MAX_IMAGE_SIZE_BYTES,
  assertValidImageFile,
  uploadImageFile,
} from "@/modules/uploads/upload.service";

function createImageFile(
  name: string,
  type: string,
  content = "file-content",
): File {
  return new File([content], name, { type });
}

describe("upload service", () => {
  beforeEach(() => {
    cloudinaryConfigMock.mockReset();
    uploadStreamMock.mockReset();
    process.env.CLOUDINARY_CLOUD_NAME = "cloud";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    process.env.CLOUDINARY_FOLDER = "nutraya";
  });

  it("rejects unsupported file types", () => {
    expect(() =>
      assertValidImageFile(createImageFile("note.txt", "text/plain")),
    ).toThrow("Unsupported image type. Use JPG, JPEG, PNG, or WEBP.");
  });

  it("rejects files larger than 5MB", () => {
    const oversizedFile = {
      type: "image/png",
      size: MAX_IMAGE_SIZE_BYTES + 1,
    } as File;

    expect(() => assertValidImageFile(oversizedFile)).toThrow(
      "Image file is too large. Maximum size is 5MB.",
    );
  });

  it("uploads a valid image and returns the secure URL", async () => {
    uploadStreamMock.mockImplementation(
      (
        _options: unknown,
        callback: (error: Error | null, result?: { secure_url: string }) => void,
      ) => ({
        end: () => callback(null, { secure_url: "https://cdn.example.com/photo.jpg" }),
      }),
    );

    await expect(
      uploadImageFile(createImageFile("photo.jpg", "image/jpeg")),
    ).resolves.toEqual({
      imageUrl: "https://cdn.example.com/photo.jpg",
    });

    expect(cloudinaryConfigMock).toHaveBeenCalled();
  });

  it("fails when Cloudinary settings are missing", async () => {
    delete process.env.CLOUDINARY_FOLDER;

    await expect(
      uploadImageFile(createImageFile("photo.jpg", "image/jpeg")),
    ).rejects.toMatchObject({
      message: "Cloudinary configuration is incomplete.",
      statusCode: 500,
    });
  });
});

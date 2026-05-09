import { v2 as cloudinary } from "cloudinary";

import { AppError } from "@/lib/errors";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type UploadImageResult = {
  imageUrl: string;
};

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER;

  if (!cloudName || !apiKey || !apiSecret || !folder) {
    throw new AppError("Cloudinary configuration is incomplete.", 500);
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}

export function assertValidImageFile(file: File | null): asserts file is File {
  if (!file) {
    throw new AppError("Image file is required.", 400);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new AppError(
      "Unsupported image type. Use JPG, JPEG, PNG, or WEBP.",
      400,
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Image file is too large. Maximum size is 5MB.", 400);
  }
}

export async function uploadImageFile(
  file: File | null,
): Promise<UploadImageResult> {
  assertValidImageFile(file);

  const config = getCloudinaryConfig();

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: config.folder,
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(uploadResult ?? {});
      },
    );

    stream.end(buffer);
  });

  if (!result.secure_url) {
    throw new AppError("Image upload failed.", 500);
  }

  return {
    imageUrl: result.secure_url,
  };
}

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES };

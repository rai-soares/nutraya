import { requireAuth } from "@/lib/auth";
import { handleRouteError, jsonResponse } from "@/lib/http";
import { uploadImageFile } from "@/modules/uploads/upload.service";

export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File ? fileEntry : null;
    const result = await uploadImageFile(file);

    return jsonResponse(result, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

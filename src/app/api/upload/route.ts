import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStorageProvider, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/storage";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(`File type '${file.type}' is not allowed. Only JPEG, PNG, and WebP images are permitted.`, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 5MB limit.`, 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storage = getStorageProvider();
    const result = await storage.upload({
      buffer,
      name: file.name,
      mimeType: file.type,
    });

    return successResponse(result, "Image uploaded successfully", 201);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("Upload error:", error);
    return errorResponse(error.message || "Failed to upload image", 500);
  }
}

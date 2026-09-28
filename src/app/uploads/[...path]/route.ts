import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Prevent directory traversal attacks
    if (
      !pathSegments ||
      pathSegments.length === 0 ||
      pathSegments.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))
    ) {
      return new NextResponse("Invalid file path", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

    // Verify the resolved path is strictly within the public/uploads directory
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(uploadsDir)) {
      return new NextResponse("Access denied", { status: 403 });
    }

    try {
      const fileBuffer = await fs.readFile(resolvedFilePath);
      const ext = path.extname(resolvedFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

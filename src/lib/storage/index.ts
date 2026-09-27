import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadedFileResult {
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(file: { buffer: Buffer; name: string; mimeType: string }): Promise<UploadedFileResult>;
  delete(fileUrl: string): Promise<boolean>;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "listings");
  }

  async upload(file: { buffer: Buffer; name: string; mimeType: string }): Promise<UploadedFileResult> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      throw new Error(`Unsupported file type: ${file.mimeType}. Allowed formats: JPEG, PNG, WebP, GIF.`);
    }

    if (file.buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size (${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB.`);
    }

    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Generate safe, collision-proof filename
    const ext = path.extname(file.name).toLowerCase() || `.${file.mimeType.split("/")[1]}`;
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const filename = `listing-${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // Save to disk
    await fs.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/listings/${filename}`,
      size: file.buffer.length,
      mimeType: file.mimeType,
    };
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith("/uploads/listings/")) {
        return false;
      }
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

let storageInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageInstance) {
    // Default to LocalStorageProvider, can be swapped with S3StorageProvider or CloudinaryStorageProvider
    storageInstance = new LocalStorageProvider();
  }
  return storageInstance;
}

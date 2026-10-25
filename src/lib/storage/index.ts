import fs from "fs/promises";
import path from "path";

export interface StoredFileResult {
  url: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  mimeType: string;
}

export interface StorageAdapter {
  saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: "images" | "videos" | "documents"
  ): Promise<StoredFileResult>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir(folder: string): Promise<string> {
    const targetDir = path.join(this.baseDir, folder);
    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  }

  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: "images" | "videos" | "documents"
  ): Promise<StoredFileResult> {
    const targetDir = await this.ensureDir(folder);

    // Generate safe clean filename with timestamp and random token
    const ext = path.extname(originalName).toLowerCase() || "";
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 50);

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalFileName = `${baseName}_${uniqueId}${ext}`;
    const destinationPath = path.join(targetDir, finalFileName);

    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${folder}/${finalFileName}`;
    const fileFormat = ext.replace(".", "") || folder;

    return {
      url: publicUrl,
      fileName: originalName,
      fileFormat,
      fileSize: buffer.length,
      mimeType,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith("/uploads/")) {
        return false;
      }
      const relativePath = fileUrl.replace("/uploads/", "");
      const absolutePath = path.join(this.baseDir, relativePath);
      await fs.unlink(absolutePath);
      return true;
    } catch (err) {
      console.warn("Failed to delete local file:", fileUrl, err);
      return false;
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();

export default storage;

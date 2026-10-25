import mongoose from "mongoose";
import { Readable } from "stream";
import path from "path";
import fs from "fs/promises";
import connectToDatabase from "@/lib/mongodb";

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

export class GridFSStorageAdapter implements StorageAdapter {
  private bucketName: string = "uploads";

  private async getBucket(): Promise<mongoose.mongo.GridFSBucket> {
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    if (!db) {
      throw new Error("MongoDB database connection is not ready for GridFS storage");
    }
    return new mongoose.mongo.GridFSBucket(db, {
      bucketName: this.bucketName,
    });
  }

  async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: "images" | "videos" | "documents"
  ): Promise<StoredFileResult> {
    const bucket = await this.getBucket();

    const ext = path.extname(originalName).toLowerCase() || "";
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 50);

    const cleanFileName = `${baseName || "file"}${ext}`;

    const uploadStream = bucket.openUploadStream(cleanFileName, {
      metadata: {
        folder,
        originalName,
        uploadedAt: new Date(),
        mimeType,
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve());
      uploadStream.end(buffer);
    });

    const fileId = uploadStream.id.toString();
    const publicUrl = `/api/media/${fileId}/${cleanFileName}`;
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
      const idMatch = fileUrl.match(/\/api\/media\/([a-f\d]{24})/i);
      if (!idMatch || !idMatch[1]) {
        return false;
      }

      const fileId = idMatch[1];
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return false;
      }

      const bucket = await this.getBucket();
      await bucket.delete(new mongoose.Types.ObjectId(fileId));
      return true;
    } catch (err) {
      console.warn("Failed to delete GridFS file:", fileUrl, err);
      return false;
    }
  }
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

// Default to MongoDB GridFS for persistent serverless and cloud storage.
// Local storage can still be explicitly selected if STORAGE_PROVIDER=local and not running on Vercel.
const isVercel = Boolean(process.env.VERCEL);
export const storage: StorageAdapter =
  !isVercel && process.env.STORAGE_PROVIDER === "local"
    ? new LocalStorageAdapter()
    : new GridFSStorageAdapter();

export default storage;


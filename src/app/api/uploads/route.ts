import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";
import storage from "@/lib/storage";

const ALLOWED_MIME_TYPES: Record<string, "images" | "videos" | "documents"> = {
  // Images
  "image/jpeg": "images",
  "image/png": "images",
  "image/webp": "images",
  "image/svg+xml": "images",
  "image/gif": "images",
  // Videos
  "video/mp4": "videos",
  "video/webm": "videos",
  "video/quicktime": "videos",
  // Documents
  "application/pdf": "documents",
  "application/msword": "documents",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "documents",
  "application/zip": "documents",
};

const MAX_FILE_SIZES = {
  images: 15 * 1024 * 1024, // 15MB
  videos: 120 * 1024 * 1024, // 120MB
  documents: 40 * 1024 * 1024, // 40MB
};

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) {
      return unauthorizedResponse("Admin authentication required to upload files");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categoryOverride = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in upload request" },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    let folder: "images" | "videos" | "documents" =
      ALLOWED_MIME_TYPES[mimeType] || "documents";

    if (categoryOverride && ["images", "videos", "documents"].includes(categoryOverride)) {
      folder = categoryOverride as "images" | "videos" | "documents";
    }

    // Size limit check
    const maxSize = MAX_FILE_SIZES[folder] || 25 * 1024 * 1024;
    if (file.size > maxSize) {
      const mbLimit = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the allowed limit of ${mbLimit}MB for ${folder}`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storage.saveFile(
      buffer,
      file.name || "uploaded_file",
      mimeType,
      folder
    );

    return NextResponse.json({
      success: true,
      file: result,
      message: "File uploaded successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload error";
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

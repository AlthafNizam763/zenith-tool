import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Readable } from "stream";
import connectToDatabase from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { path: routeParams } = await params;
    const fileId = routeParams?.[0];

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json(
        { error: "Invalid media file identifier" },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    const db = conn.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 503 }
      );
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });

    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Requested media not found" },
        { status: 404 }
      );
    }

    const fileDoc = files[0];
    const totalLength = fileDoc.length;
    const metadata = (fileDoc.metadata || {}) as Record<string, unknown>;
    const contentType =
      (metadata.mimeType as string) ||
      (metadata.contentType as string) ||
      "application/octet-stream";
    const filename = fileDoc.filename || "file";

    const baseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
    };

    // Range Request Handling (crucial for video scrubbing and mobile playback)
    const rangeHeader = req.headers.get("range");

    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

      if (
        isNaN(start) ||
        isNaN(end) ||
        start >= totalLength ||
        end >= totalLength ||
        start > end
      ) {
        return new NextResponse(null, {
          status: 416, // Range Not Satisfiable
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes */${totalLength}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const downloadStream = bucket.openDownloadStream(objectId, {
        start,
        end: end + 1, // GridFS openDownloadStream end offset is exclusive
      });

      const webStream = Readable.toWeb(downloadStream as unknown as Readable);

      return new NextResponse(webStream as unknown as BodyInit, {
        status: 206, // Partial Content
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${totalLength}`,
          "Content-Length": chunkSize.toString(),
        },
      });
    }

    // Full file streaming
    const downloadStream = bucket.openDownloadStream(objectId);
    const webStream = Readable.toWeb(downloadStream as unknown as Readable);

    return new NextResponse(webStream as unknown as BodyInit, {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Length": totalLength.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Media streaming error";
    console.error("Media streaming route error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest, { params }: RouteContext) {
  try {
    const { path: routeParams } = await params;
    const fileId = routeParams?.[0];

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return new NextResponse(null, { status: 400 });
    }

    const conn = await connectToDatabase();
    const db = conn.connection.db;

    if (!db) {
      return new NextResponse(null, { status: 503 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });

    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();

    if (!files || files.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const fileDoc = files[0];
    const metadata = (fileDoc.metadata || {}) as Record<string, unknown>;
    const contentType =
      (metadata.mimeType as string) ||
      (metadata.contentType as string) ||
      "application/octet-stream";

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileDoc.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

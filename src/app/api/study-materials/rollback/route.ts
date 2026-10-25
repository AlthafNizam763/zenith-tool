import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudyMaterial from "@/models/StudyMaterial";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();
    const { logicalId = "rank_file", targetVersion } = body;

    if (!targetVersion) {
      return NextResponse.json(
        { success: false, error: "Target version is required for rollback" },
        { status: 400 }
      );
    }

    const material = await StudyMaterial.findOne({ logicalId });
    if (!material) {
      return NextResponse.json(
        { success: false, error: "Study material not found" },
        { status: 404 }
      );
    }

    const entryIndex = material.history.findIndex(
      (h) => h.version === targetVersion
    );

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Version ${targetVersion} not found in history` },
        { status: 404 }
      );
    }

    const targetHistorical = material.history[entryIndex];

    // Archive current file into history
    material.history.unshift({
      fileUrl: material.fileUrl,
      fileName: material.fileName,
      fileFormat: material.fileFormat,
      fileSize: material.fileSize,
      coverImageUrl: material.coverImageUrl,
      version: material.version,
      replacedAt: new Date(),
      note: `Rolled back to v${targetVersion}`,
    });

    // Restore historical file
    material.version += 1;
    material.fileUrl = targetHistorical.fileUrl;
    material.fileName = targetHistorical.fileName;
    material.fileFormat = targetHistorical.fileFormat;
    material.fileSize = targetHistorical.fileSize;
    if (targetHistorical.coverImageUrl) {
      material.coverImageUrl = targetHistorical.coverImageUrl;
    }

    await material.save();

    return NextResponse.json({
      success: true,
      material,
      message: `Rolled back to file from version ${targetVersion} as version ${material.version}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error rolling back file";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

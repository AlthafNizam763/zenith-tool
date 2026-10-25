import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudyMaterial from "@/models/StudyMaterial";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const logicalId = searchParams.get("logicalId") || "rank_file";

    let material = await StudyMaterial.findOne({ logicalId });

    if (!material && logicalId === "rank_file") {
      material = await StudyMaterial.create({
        logicalId: "rank_file",
        title: "Zenith Academy Rank File 2026",
        description:
          "Prepared by experienced faculty and aligned with the latest PSC and JHI syllabus, previous question patterns, and exam strategies with 8000+ MCQs.",
        fileUrl:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/0f20e046bbc93b7e07c213660b86d641a802c743b79a74f470d9c6aedcf26551?apiKey=a9ef1b359bc94027b911d1891520fd40&",
        fileName: "Zenith_Academy_Rankfile_Official.pdf",
        fileFormat: "pdf",
        fileSize: 14857600,
        coverImageUrl:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/0f20e046bbc93b7e07c213660b86d641a802c743b79a74f470d9c6aedcf26551?apiKey=a9ef1b359bc94027b911d1891520fd40&",
        version: 1,
        isPublished: true,
        history: [],
      });
    }

    return NextResponse.json({ success: true, material });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching study material";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Replace study material file with confirmation / versioning
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();

    const {
      logicalId = "rank_file",
      title,
      description,
      fileUrl,
      fileName,
      fileFormat,
      fileSize,
      coverImageUrl,
      isPublished,
      note,
    } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "File URL is required" },
        { status: 400 }
      );
    }

    let material = await StudyMaterial.findOne({ logicalId });

    if (!material) {
      material = new StudyMaterial({
        logicalId,
        title: title || "Zenith Academy Rank File",
        description: description || "",
        fileUrl,
        fileName: fileName || "rank_file.pdf",
        fileFormat: fileFormat || "pdf",
        fileSize: fileSize || 0,
        coverImageUrl: coverImageUrl || "",
        isPublished: isPublished !== false,
        version: 1,
        history: [],
      });
    } else {
      // Archive current file into version history
      material.history.unshift({
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        fileFormat: material.fileFormat,
        fileSize: material.fileSize,
        coverImageUrl: material.coverImageUrl,
        version: material.version,
        replacedAt: new Date(),
        note: note || "File replacement",
      });

      // Keep up to 10 versions
      if (material.history.length > 10) {
        material.history = material.history.slice(0, 10);
      }

      material.version += 1;
      material.fileUrl = fileUrl;
      material.fileName = fileName || material.fileName;
      material.fileFormat = fileFormat || material.fileFormat;
      material.fileSize = fileSize || material.fileSize;
      if (coverImageUrl !== undefined) material.coverImageUrl = coverImageUrl;
      if (title !== undefined) material.title = title;
      if (description !== undefined) material.description = description;
      if (isPublished !== undefined) material.isPublished = isPublished;
    }

    await material.save();

    return NextResponse.json({
      success: true,
      material,
      message: `Study material file replaced and published as version ${material.version}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error replacing study material";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Edit metadata without replacing file
export async function PUT(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();
    const { logicalId = "rank_file" } = body;

    const material = await StudyMaterial.findOne({ logicalId });
    if (!material) {
      return NextResponse.json(
        { success: false, error: "Study material not found" },
        { status: 404 }
      );
    }

    if (body.title !== undefined) material.title = body.title;
    if (body.description !== undefined) material.description = body.description;
    if (body.coverImageUrl !== undefined) material.coverImageUrl = body.coverImageUrl;
    if (body.isPublished !== undefined) material.isPublished = body.isPublished;

    await material.save();

    return NextResponse.json({
      success: true,
      material,
      message: "Study material details updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating study material";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HomepageVideo from "@/models/HomepageVideo";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();
    const { targetVersion } = body;

    if (!targetVersion) {
      return NextResponse.json(
        { success: false, error: "Target version is required for rollback" },
        { status: 400 }
      );
    }

    const current = await HomepageVideo.findOne().sort({ updatedAt: -1 });
    if (!current) {
      return NextResponse.json(
        { success: false, error: "Video configuration not found" },
        { status: 404 }
      );
    }

    const historicalEntryIndex = current.history.findIndex(
      (h) => h.version === targetVersion
    );

    if (historicalEntryIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Version ${targetVersion} not found in history` },
        { status: 404 }
      );
    }

    const targetHistorical = current.history[historicalEntryIndex];

    // Archive current before restoring
    current.history.unshift({
      videoUrl: current.videoUrl,
      videoUrlMedium: current.videoUrlMedium,
      videoUrlSmall: current.videoUrlSmall,
      posterUrl: current.posterUrl,
      title: current.title,
      description: current.description,
      version: current.version,
      replacedAt: new Date(),
    });

    // Restore target
    current.version += 1;
    current.videoUrl = targetHistorical.videoUrl;
    current.videoUrlMedium = targetHistorical.videoUrlMedium;
    current.videoUrlSmall = targetHistorical.videoUrlSmall;
    current.posterUrl = targetHistorical.posterUrl;
    if (targetHistorical.title) current.title = targetHistorical.title;
    if (targetHistorical.description) current.description = targetHistorical.description;

    await current.save();

    return NextResponse.json({
      success: true,
      video: current,
      message: `Rolled back to settings from version ${targetVersion} as version ${current.version}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error rolling back video";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

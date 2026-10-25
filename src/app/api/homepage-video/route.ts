import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HomepageVideo from "@/models/HomepageVideo";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    let videoConfig = await HomepageVideo.findOne().sort({ updatedAt: -1 });

    if (!videoConfig) {
      // Create initial record
      videoConfig = await HomepageVideo.create({
        title: "Homepage Header Video",
        description:
          "Consistently Producing Top Rankers in PSC & JHI Examinations",
        videoUrl:
          "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(bigscreen).mp4?alt=media&token=6a0192ac-1719-43fd-8201-cf6264e45458",
        videoUrlMedium:
          "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(medium).mp4?alt=media&token=2e5cbf32-a34f-4445-946c-d8a2262ff3b2",
        videoUrlSmall:
          "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(small).mp4?alt=media&token=966408df-8be3-41c7-b7ba-c59cbe921f53",
        posterUrl: "",
        isPublished: true,
        version: 1,
        history: [],
      });
    }

    return NextResponse.json({ success: true, video: videoConfig });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching homepage video";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Replace / publish replacement homepage video
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();

    const {
      videoUrl,
      videoUrlMedium,
      videoUrlSmall,
      posterUrl,
      title,
      description,
      isPublished,
    } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Main Video URL is required" },
        { status: 400 }
      );
    }

    let current = await HomepageVideo.findOne().sort({ updatedAt: -1 });

    if (!current) {
      current = new HomepageVideo({
        title: title || "Homepage Header Video",
        description: description || "",
        videoUrl,
        videoUrlMedium: videoUrlMedium || videoUrl,
        videoUrlSmall: videoUrlSmall || videoUrl,
        posterUrl: posterUrl || "",
        isPublished: isPublished !== false,
        version: 1,
        history: [],
      });
    } else {
      // Archive the current version into history before replacing
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

      // Keep up to 10 versions in history
      if (current.history.length > 10) {
        current.history = current.history.slice(0, 10);
      }

      current.version += 1;
      current.videoUrl = videoUrl;
      current.videoUrlMedium = videoUrlMedium || videoUrl;
      current.videoUrlSmall = videoUrlSmall || videoUrl;
      if (posterUrl !== undefined) current.posterUrl = posterUrl;
      if (title !== undefined) current.title = title;
      if (description !== undefined) current.description = description;
      if (isPublished !== undefined) current.isPublished = isPublished;
    }

    await current.save();

    return NextResponse.json({
      success: true,
      video: current,
      message: `Homepage video updated to version ${current.version}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error replacing homepage video";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Update current video metadata without creating a new version
export async function PUT(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();

    const current = await HomepageVideo.findOne().sort({ updatedAt: -1 });
    if (!current) {
      return NextResponse.json(
        { success: false, error: "Homepage video configuration not found" },
        { status: 404 }
      );
    }

    if (body.title !== undefined) current.title = body.title;
    if (body.description !== undefined) current.description = body.description;
    if (body.posterUrl !== undefined) current.posterUrl = body.posterUrl;
    if (body.isPublished !== undefined) current.isPublished = body.isPublished;

    await current.save();

    return NextResponse.json({
      success: true,
      video: current,
      message: "Homepage video metadata updated",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating homepage video";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentSuccessStory from "@/models/StudentSuccessStory";
import HomepageVideo from "@/models/HomepageVideo";
import HappeningNow from "@/models/HappeningNow";
import StudyMaterial from "@/models/StudyMaterial";
import { seedInitialContent } from "@/lib/seed";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    await connectToDatabase();
    await seedInitialContent();

    const [stories, homepageVideo, banners, studyMaterial] = await Promise.all([
      StudentSuccessStory.find({ isPublished: true })
        .sort({ order: 1, createdAt: -1 })
        .select("-__v"),
      HomepageVideo.findOne({ isPublished: true })
        .sort({ updatedAt: -1 })
        .select("title description videoUrl videoUrlMedium videoUrlSmall posterUrl version"),
      HappeningNow.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("title description imageUrl linkUrl order"),
      StudyMaterial.findOne({ logicalId: "rank_file", isPublished: true }).select(
        "logicalId title description fileUrl fileName fileFormat fileSize coverImageUrl version"
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          homepageVideo: homepageVideo || null,
          stories: stories || [],
          banners: banners || [],
          studyMaterial: studyMaterial || null,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching content";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

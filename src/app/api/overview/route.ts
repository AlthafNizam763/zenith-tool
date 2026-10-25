import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentSuccessStory from "@/models/StudentSuccessStory";
import HomepageVideo from "@/models/HomepageVideo";
import HappeningNow from "@/models/HappeningNow";
import StudyMaterial from "@/models/StudyMaterial";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";
import { seedInitialContent } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    await seedInitialContent();

    const [
      totalStories,
      imageStories,
      videoStories,
      publishedStories,
      homepageVideo,
      totalBanners,
      activeBanners,
      studyMaterial,
    ] = await Promise.all([
      StudentSuccessStory.countDocuments(),
      StudentSuccessStory.countDocuments({ type: "image" }),
      StudentSuccessStory.countDocuments({ type: "video" }),
      StudentSuccessStory.countDocuments({ isPublished: true }),
      HomepageVideo.findOne().sort({ updatedAt: -1 }),
      HappeningNow.countDocuments(),
      HappeningNow.countDocuments({ isActive: true }),
      StudyMaterial.findOne({ logicalId: "rank_file" }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        stories: {
          total: totalStories,
          images: imageStories,
          videos: videoStories,
          published: publishedStories,
          drafts: totalStories - publishedStories,
        },
        homepageVideo: {
          title: homepageVideo?.title || "Homepage Header Video",
          version: homepageVideo?.version || 1,
          isPublished: homepageVideo?.isPublished ?? true,
          updatedAt: homepageVideo?.updatedAt || new Date(),
          videoUrl: homepageVideo?.videoUrl || "",
        },
        banners: {
          total: totalBanners,
          active: activeBanners,
        },
        studyMaterial: {
          title: studyMaterial?.title || "Rank File",
          fileName: studyMaterial?.fileName || "rank_file.pdf",
          version: studyMaterial?.version || 1,
          fileSize: studyMaterial?.fileSize || 0,
          updatedAt: studyMaterial?.updatedAt || new Date(),
          isPublished: studyMaterial?.isPublished ?? true,
        },
        database: {
          connected: true,
          provider: "MongoDB Atlas",
          databaseName: process.env.MONGODB_DB || "zenith_academy",
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading overview stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

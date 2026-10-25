import connectToDatabase from "./mongodb";
import { ensureDefaultAdmin } from "./auth";
import HomepageVideo from "../models/HomepageVideo";
import StudentSuccessStory from "../models/StudentSuccessStory";
import HappeningNow from "../models/HappeningNow";
import StudyMaterial from "../models/StudyMaterial";

export async function seedInitialContent() {
  await connectToDatabase();
  await ensureDefaultAdmin();

  // 1. Seed Homepage Video if not exists
  const videoCount = await HomepageVideo.countDocuments();
  if (videoCount === 0) {
    await HomepageVideo.create({
      title: "Hero Background Header Video",
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
    console.log("[SEED] Initial Homepage Video created");
  }

  // 2. Seed Student Success Stories if empty
  const storyCount = await StudentSuccessStory.countDocuments();
  if (storyCount === 0) {
    const initialStories = [
      {
        title: "Rank 1 Holder - PSC JHI 2023",
        studentName: "Fathima Sana PT",
        type: "video" as const,
        mediaUrl:
          "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(small).mp4?alt=media&token=966408df-8be3-41c7-b7ba-c59cbe921f53",
        thumbnailUrl: "",
        description:
          "Great classes, really helpful and inspiring. The faculty explanations gave me the confidence to crack the exam.",
        achievementDetails: "Malappuram District Rank Holder",
        order: 1,
        isPublished: true,
      },
      {
        title: "Top Ranker - PHI Examination 2025",
        studentName: "Anjana Suresh",
        type: "image" as const,
        mediaUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        description:
          "Clear teaching, supportive faculty, motivating environment and good guidance.",
        achievementDetails: "Thrissur District Rank Holder",
        order: 2,
        isPublished: true,
      },
      {
        title: "Medical Education Coaching Success",
        studentName: "Athira U.R.",
        type: "image" as const,
        mediaUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        description:
          "Excellent classes, Zenith was the best decision I ever made.",
        achievementDetails: "Trivandrum District Rank Holder",
        order: 3,
        isPublished: true,
      },
      {
        title: "Treatment Organizer Rank Holder",
        studentName: "Aiswarya",
        type: "video" as const,
        mediaUrl:
          "https://firebasestorage.googleapis.com/v0/b/zenithacademylive.firebasestorage.app/o/web_header_video%2Fweb%20bg%20(medium).mp4?alt=media&token=2e5cbf32-a34f-4445-946c-d8a2262ff3b2",
        description:
          "Classes were clear, easy to understand, and helped me revise important topics quickly.",
        achievementDetails: "Kottayam District Rank Holder",
        order: 4,
        isPublished: true,
      },
    ];

    await StudentSuccessStory.insertMany(initialStories);
    console.log("[SEED] Initial Student Success Stories created");
  }

  // 3. Seed Happening Now banners if empty
  const bannerCount = await HappeningNow.countDocuments();
  if (bannerCount === 0) {
    const initialBanners = [
      {
        title: "New Batch Admissions Open 2026",
        description: "Join comprehensive coaching for JHI & PHI competitive exams.",
        imageUrl:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        linkUrl: "https://wa.me/919400266949",
        order: 1,
        isActive: true,
      },
      {
        title: "Rank File Special Release & Mock Test Series",
        description: "8000+ targeted MCQs with answer keys and in-depth video solutions.",
        imageUrl:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
        linkUrl: "https://wa.me/919400266949",
        order: 2,
        isActive: true,
      },
      {
        title: "Zenith App Free Diagnostic Test",
        description: "Evaluate your current score and receive personalized feedback.",
        imageUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        linkUrl: "https://wa.me/919400266949",
        order: 3,
        isActive: true,
      },
    ];

    await HappeningNow.insertMany(initialBanners);
    console.log("[SEED] Initial Happening Now banners created");
  }

  // 4. Seed Study Material (Rank File) if empty
  const studyMaterialCount = await StudyMaterial.countDocuments();
  if (studyMaterialCount === 0) {
    await StudyMaterial.create({
      logicalId: "rank_file",
      title: "Zenith Academy Rank File 2026",
      description:
        "Prepared by experienced faculty and aligned with the latest PSC and JHI syllabus, previous question patterns, and exam strategies with 8000+ MCQs.",
      fileUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/0f20e046bbc93b7e07c213660b86d641a802c743b79a74f470d9c6aedcf26551?apiKey=a9ef1b359bc94027b911d1891520fd40&",
      fileName: "Zenith_Academy_Rankfile_Official.pdf",
      fileFormat: "pdf",
      fileSize: 14857600, // ~14.1 MB
      coverImageUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/0f20e046bbc93b7e07c213660b86d641a802c743b79a74f470d9c6aedcf26551?apiKey=a9ef1b359bc94027b911d1891520fd40&",
      version: 1,
      isPublished: true,
      history: [],
    });
    console.log("[SEED] Initial Study Material (Rank File) created");
  }

  return { success: true };
}

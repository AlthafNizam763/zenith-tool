import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedInitialContent();

    const { searchParams } = new URL(req.url);
    const logicalId = searchParams.get("logicalId") || "rank_file";

    const material = await StudyMaterial.findOne({
      logicalId,
      isPublished: true,
    }).select(
      "logicalId title description fileUrl fileName fileFormat fileSize coverImageUrl version"
    );

    return NextResponse.json({ success: true, material }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching study material";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

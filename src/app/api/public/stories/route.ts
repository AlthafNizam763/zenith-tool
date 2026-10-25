import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentSuccessStory from "@/models/StudentSuccessStory";
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
    const type = searchParams.get("type");

    const query: Record<string, unknown> = { isPublished: true };
    if (type && ["image", "video"].includes(type)) {
      query.type = type;
    }

    const stories = await StudentSuccessStory.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    return NextResponse.json({ success: true, stories }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching stories";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

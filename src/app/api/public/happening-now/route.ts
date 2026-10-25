import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HappeningNow from "@/models/HappeningNow";
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

    const banners = await HappeningNow.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select("title description imageUrl linkUrl order");

    return NextResponse.json({ success: true, banners }, { headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching banners";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

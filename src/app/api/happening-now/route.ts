import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HappeningNow from "@/models/HappeningNow";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const banners = await HappeningNow.find().sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, banners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching banners";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();

    const { title, description, imageUrl, linkUrl, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Banner image URL is required" },
        { status: 400 }
      );
    }

    let bannerOrder = order;
    if (bannerOrder === undefined || bannerOrder === null) {
      const highest = await HappeningNow.findOne().sort({ order: -1 });
      bannerOrder = (highest?.order ?? 0) + 1;
    }

    const banner = await HappeningNow.create({
      title: title || "",
      description: description || "",
      imageUrl,
      linkUrl: linkUrl || "",
      order: bannerOrder,
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      banner,
      message: "Banner created successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating banner";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Expected an array of items" },
        { status: 400 }
      );
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await HappeningNow.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: "Banner order updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

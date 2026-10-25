import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentSuccessStory from "@/models/StudentSuccessStory";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (type && ["image", "video"].includes(type)) {
      query.type = type;
    }

    if (status === "published") {
      query.isPublished = true;
    } else if (status === "draft") {
      query.isPublished = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { achievementDetails: { $regex: search, $options: "i" } },
      ];
    }

    const stories = await StudentSuccessStory.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    return NextResponse.json({ success: true, stories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching stories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      studentName,
      type,
      mediaUrl,
      thumbnailUrl,
      description,
      achievementDetails,
      order,
      isPublished,
    } = body;

    if (!mediaUrl) {
      return NextResponse.json(
        { success: false, error: "Media URL is required" },
        { status: 400 }
      );
    }

    // Determine highest order if not supplied
    let storyOrder = order;
    if (storyOrder === undefined || storyOrder === null) {
      const highest = await StudentSuccessStory.findOne().sort({ order: -1 });
      storyOrder = (highest?.order ?? 0) + 1;
    }

    const story = await StudentSuccessStory.create({
      title: title || "",
      studentName: studentName || "",
      type: type || "image",
      mediaUrl,
      thumbnailUrl: thumbnailUrl || "",
      description: description || "",
      achievementDetails: achievementDetails || "",
      order: storyOrder,
      isPublished: isPublished !== false,
    });

    return NextResponse.json({
      success: true,
      story,
      message: "Story created successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating story";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Bulk reorder stories
export async function PATCH(req: NextRequest) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const body = await req.json();
    const { items } = body; // Array of { id: string, order: number }

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
      await StudentSuccessStory.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: "Story order updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

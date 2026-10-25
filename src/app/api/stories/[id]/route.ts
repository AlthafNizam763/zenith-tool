import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import StudentSuccessStory from "@/models/StudentSuccessStory";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const { id } = await params;
    const story = await StudentSuccessStory.findById(id);

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching story";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existingStory = await StudentSuccessStory.findById(id);
    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    // Update fields (replacing media updates the existing record, not creating duplicates)
    if (body.title !== undefined) existingStory.title = body.title;
    if (body.studentName !== undefined) existingStory.studentName = body.studentName;
    if (body.type !== undefined) existingStory.type = body.type;
    if (body.mediaUrl !== undefined) existingStory.mediaUrl = body.mediaUrl;
    if (body.thumbnailUrl !== undefined) existingStory.thumbnailUrl = body.thumbnailUrl;
    if (body.description !== undefined) existingStory.description = body.description;
    if (body.achievementDetails !== undefined)
      existingStory.achievementDetails = body.achievementDetails;
    if (body.order !== undefined) existingStory.order = body.order;
    if (body.isPublished !== undefined) existingStory.isPublished = body.isPublished;

    await existingStory.save();

    return NextResponse.json({
      success: true,
      story: existingStory,
      message: "Story updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating story";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth(req);
    if (!admin) return unauthorizedResponse();

    await connectToDatabase();
    const { id } = await params;

    const deleted = await StudentSuccessStory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting story";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

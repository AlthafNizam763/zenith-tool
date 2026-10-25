import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HappeningNow from "@/models/HappeningNow";
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
    const banner = await HappeningNow.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, banner });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching banner";
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

    const banner = await HappeningNow.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 }
      );
    }

    if (body.title !== undefined) banner.title = body.title;
    if (body.description !== undefined) banner.description = body.description;
    if (body.imageUrl !== undefined) banner.imageUrl = body.imageUrl;
    if (body.linkUrl !== undefined) banner.linkUrl = body.linkUrl;
    if (body.order !== undefined) banner.order = body.order;
    if (body.isActive !== undefined) banner.isActive = body.isActive;

    await banner.save();

    return NextResponse.json({
      success: true,
      banner,
      message: "Banner updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating banner";
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

    const deleted = await HappeningNow.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting banner";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

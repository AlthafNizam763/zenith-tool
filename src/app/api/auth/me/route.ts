import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await checkAdminAuth(req);
  if (!admin) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    user: admin,
  });
}

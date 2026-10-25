import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "./mongodb";
import Admin, { IAdmin } from "../models/Admin";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET ||
    "zenith_academy_super_secure_admin_jwt_secret_key_2026_xyz987"
);

export const COOKIE_NAME = "zenith_admin_token";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionAdmin(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function checkAdminAuth(req: NextRequest): Promise<SessionPayload | null> {
  // Check cookie first
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    const payload = await verifySessionToken(cookieToken);
    if (payload) return payload;
  }

  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifySessionToken(token);
    if (payload) return payload;
  }

  return null;
}

export function unauthorizedResponse(message = "Unauthorized access"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

// Auto-seed initial admin user if none exists
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    await connectToDatabase();
    const count = await Admin.countDocuments();
    if (count === 0) {
      const defaultEmail = "admin@zenithacademy.com";
      const defaultPassword = "ZenithAdmin2026!";
      const passwordHash = await hashPassword(defaultPassword);

      await Admin.create({
        email: defaultEmail,
        passwordHash,
        name: "Zenith Master Admin",
        role: "superadmin",
      });

      console.log(`[AUTH] Created default admin account: ${defaultEmail} / ${defaultPassword}`);
    }
  } catch (err) {
    console.error("[AUTH] Error ensuring default admin:", err);
  }
}

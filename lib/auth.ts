// lib/auth.ts
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}

interface JwtPayload {
  userId: string;
  role?: string;
}

/**
 * ตรวจสอบและถอดรหัส JWT token
 * คืนค่า payload หรือ null ถ้าไม่ถูกต้อง
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
}

/**
 * ดึง user จาก Authorization header แบบ Bearer token
 * คืนค่า User หรือ null ถ้าไม่พบ หรือ token ไม่ถูกต้อง
 */
export async function getUserFromToken(
  authHeader: string | undefined
): Promise<User | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring("Bearer ".length);
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  return user;
}

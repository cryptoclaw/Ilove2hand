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
}

/**
 * ดึง user จาก Authorization header
 * คืนค่า User หรือ null ถ้าไม่พบหรือ token ไม่ถูกต้อง
 */
export async function getUserFromToken(
  authHeader: string | undefined
): Promise<User | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
}

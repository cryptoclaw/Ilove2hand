// lib/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

/** payload ใน JWT */
export interface JwtPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/** ออก token */
export function signToken(user: { id: string; role?: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role ?? "USER" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/** verify สตริง token ดิบ (ไม่ใส่คำว่า Bearer) */
export function verifyRawToken(raw?: string): JwtPayload | null {
  if (!raw) return null;
  try {
    return jwt.verify(raw, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/** ดึง user จาก Authorization header ("Bearer xxx") หรือสตริง token ที่ส่งมา */
export async function getUserFromToken(
  authHeaderOrToken?: string
): Promise<User | null> {
  if (!authHeaderOrToken) return null;
  const raw = authHeaderOrToken.startsWith("Bearer ")
    ? authHeaderOrToken.slice(7)
    : authHeaderOrToken;
  const payload = verifyRawToken(raw);
  if (!payload?.userId) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

/** ดึง user จากคุกกี้ HttpOnly ชื่อ "token" (เหมาะกับ API ที่ใช้ credentials: 'include') */
export async function getSessionUserFromReq(
  req: NextApiRequest
): Promise<User | null> {
  const cookieToken = req.cookies?.token;
  const payload = verifyRawToken(cookieToken);
  if (!payload?.userId) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

/**
 * ใช้ใน API แอดมิน: ตรวจสิทธิ์ และคืน user ถ้าผ่าน
 * - พยายามอ่านจากคุกกี้ก่อน
 * - ถ้าไม่มีคุกกี้ ลองอ่านจาก Authorization header
 * - ถ้าไม่ใช่ ADMIN จะตอบ 403 และคืน null
 */
export async function requireAdminApi(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  // ลองจากคุกกี้ก่อน
  let user = await getSessionUserFromReq(req);

  // ถ้าไม่มีคุกกี้ ลองจาก Authorization header (Bearer xxx)
  if (!user && req.headers.authorization) {
    user = await getUserFromToken(req.headers.authorization);
  }

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin only" });
    return null;
  }
  return user;
}

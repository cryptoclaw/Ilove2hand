// lib/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment");

export interface JwtPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    return jwt.verify(raw, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function signToken(user: { id: string; role?: string }) {
  return jwt.sign({ userId: user.id, role: user.role ?? "USER" }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function getSessionUserFromReq(req: NextApiRequest): Promise<User | null> {
  const cookieToken = req.cookies?.token;
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload?.userId) return prisma.user.findUnique({ where: { id: payload.userId } });
  }
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const payload = verifyToken(auth);
    if (payload?.userId) return prisma.user.findUnique({ where: { id: payload.userId } });
  }
  return null;
}

export async function requireAdminApi(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUserFromReq(req);
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin only" });
    return null;
  }
  return user;
}

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

const COOKIE_NAME = "token";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const token = cookieToken ?? bearerToken;

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "PATCH") {
    const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string | null };
    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        },
        select: { id: true, name: true, email: true, avatarUrl: true, role: true },
      });
      return res.status(200).json({ user: updated });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Cannot update profile" });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

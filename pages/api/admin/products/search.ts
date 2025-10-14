import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET"); 
    return res.status(405).end();
  }
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const list = await prisma.product.findMany({
    where: q
      ? { translations: { some: { name: { contains: q, mode: "insensitive" } } } }
      : undefined,
    take: 20,
    include: { translations: true },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(list);
}

// pages/api/banners/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  if (req.method === "PUT") {
    const { title, sub, order } = req.body as {
      title?: string;
      sub?: string;
      order?: number;
    };
    const updated = await prisma.banner.update({
      where: { id },
      data: { title, sub, order },
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.banner.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

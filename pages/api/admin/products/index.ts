import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) return res.status(400).json({ error: "name is required" });

  const created = await prisma.product.create({
    data: {
      price: Number(b.price ?? 0),
      stock: Number(b.stock ?? 1),
      imageUrl: b.imageUrl ? String(b.imageUrl) : null,
      translations: {
        create: [
          { locale: "en", name, description: b.description ?? null },
          { locale: "th", name, description: b.description ?? null },
        ],
      },
    },
    include: { translations: true },
  });

  res.status(201).json(created);
});

export default handler;

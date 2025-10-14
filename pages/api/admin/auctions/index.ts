// pages/api/admin/auctions/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { requireAdminApi } from '@/lib/auth';
import { createAuction, listAuctions } from '@/services/auctionService';
import { prisma } from "@/lib/prisma";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.get(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const status = typeof req.query.status === 'string' ? (req.query.status.toUpperCase() as any) : undefined;

  const data = await listAuctions({ q, status });
  res.status(200).json(data);
});

handler.post(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  const b = req.body || {};
  let productId = String(b.productId || "");

  // ✅ ถ้าไม่ได้ส่ง productId มา แต่มี productInput → สร้าง product ก่อน
  if (!productId && b.productInput) {
    const p = b.productInput;
    const name = String(p.name || "").trim();
    if (!name) return res.status(400).json({ error: "Product name is required" });

    const newProduct = await prisma.product.create({
      data: {
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 1),
        imageUrl: p.imageUrl ? String(p.imageUrl) : null,
        translations: {
          create: [
            { locale: "en", name, description: p.description ?? null },
            { locale: "th", name, description: p.description ?? null },
          ],
        },
      },
    });
    productId = newProduct.id;
  }

  if (!productId) return res.status(400).json({ error: "Product is required" });

  const dto = {
    productId,
    sellerId: String(b.sellerId ?? admin.id),
    title: String(b.title || "").trim() || "Untitled Auction",
    description: b.description ? String(b.description) : undefined,
    startPrice: Number(b.startPrice),
    bidIncrement: b.bidIncrement ? Number(b.bidIncrement) : undefined,
    startAt: new Date(b.startAt),
    endAt: new Date(b.endAt),
  };

  const created = await createAuction(dto);
  res.status(201).json(created);
});

export default handler;

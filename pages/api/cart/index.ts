// pages/api/cart.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromReq } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ อ่าน user จากคุกกี้/เฮดเดอร์
  const user = await getSessionUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
    return res.status(200).json({ items: cart?.items || [] });
  }

  if (req.method === "POST") {
    const { productId, quantity } = req.body as { productId: string; quantity: number };
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        })
      : await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        });

    return res.status(200).json(item);
  }

  if (req.method === "PATCH") {
    const { itemId, quantity } = req.body as { itemId: string; quantity: number };
    if (!itemId || quantity == null || quantity < 1) {
      return res.status(400).json({ error: "Invalid itemId or quantity" });
    }
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return res.status(200).json(updatedItem);
  }

  if (req.method === "DELETE") {
    const { itemId } = req.body as { itemId?: string };
    if (!itemId) return res.status(400).json({ error: "Missing itemId" });
    await prisma.cartItem.delete({ where: { id: itemId } });
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

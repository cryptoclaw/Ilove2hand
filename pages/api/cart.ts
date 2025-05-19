// pages/api/cart.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ตรวจ token และดึง user
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET /api/cart → ดึงรายการในตะกร้า
  if (req.method === "GET") {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true, // ดึงข้อมูล Product ทั้งหมดมาด้วย
          },
        },
      },
    });
    // ถ้า user ยังไม่มี cart สร้างเปล่า ๆ
    const items = cart?.items || [];
    return res.status(200).json({ items });
  }

  // POST /api/cart → เพิ่มหรืออัปเดตจำนวนในตะกร้า
  if (req.method === "POST") {
    const { productId, quantity } = req.body as {
      productId: string;
      quantity: number;
    };

    // 1) upsert cart
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // 2) หาดูว่ามีไอเท็มนี้อยู่แล้วหรือไม่
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    let item;
    if (existing) {
      // 3a) ถ้ามีแล้ว → update จำนวน
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      // 3b) ถ้าไม่มี → สร้างใหม่
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return res.status(200).json(item);
  }

  // อื่น ๆ → ไม่อนุญาต
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
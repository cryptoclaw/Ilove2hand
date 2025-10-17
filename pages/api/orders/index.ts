// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromReq } from "@/lib/auth";

function pickFirstName(p: any, it: any): string | null {
  const cands = [
    p?.name, p?.title, p?.productName, p?.nameTH, p?.thName, p?.label,
    it?.productName, it?.name, it?.title,
  ];
  return (cands.find((v) => typeof v === "string" && v.trim().length > 0) as string) ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } }, // ดึงทั้งก้อนไว้ก่อน
    },
  });

  const dto = orders.map((o) => ({
    id: o.id,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it: any) => {
      const p = it.product ?? {};
      return {
        id: it.id,
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
        // ส่ง name แบบคำนวนมาให้ FE ใช้ตรง ๆ
        product: {
          name: pickFirstName(p, it),
          imageUrl: p?.imageUrl ?? it?.imageUrl ?? p?.image ?? null,
        },
      };
    }),
  }));

  return res.status(200).json({ orders: dto });
}

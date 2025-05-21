// pages/api/admin/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end();
  }

  // ตรวจสอบว่าเป็นแอดมิน
  const authHeader = req.headers.authorization;
  const user = await getUserFromToken(authHeader);
  if (!user || user.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ตรวจสอบค่าสถานะใหม่
  const { status } = req.body;
  const allowed = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updated = await prisma.order.update({
      where: { id: id as string },
      data: { status },
    });
    return res.status(200).json(updated);
  } catch (e) {
    console.error("Update order status error:", e);
    return res.status(500).json({ error: "Cannot update order status" });
  }
}

// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid product id" });
  }

  if (req.method === "DELETE") {
    try {
      // เริ่ม transaction: ลบ cartItems, orderItems ก่อน แล้วลบ product
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.orderItem.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);

      // ถ้าสำเร็จ ส่ง 204 No Content กลับ
      return res.status(204).end();
    } catch (error: any) {
      console.error("Delete product error:", error);
      // ถ้าเป็น constraint error ก็แจ้งกลับ
      return res
        .status(500)
        .json({ error: "ไม่สามารถลบสินค้าได้ เนื่องจากมีข้อมูลอ้างอิงอยู่" });
    }
  }

  // อนุญาตแค่ DELETE
  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

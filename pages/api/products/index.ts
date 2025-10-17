// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // ดึงสินค้าทั้งหมด (จะขยายตามที่ต้องการได้)
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        translations: true,
        category: true,
      },
    });
    return res.status(200).json(products);
  }

  // ---------------- POST ----------------
  if (req.method === "POST") {
    try {
      const {
        nameTh,
        nameEn,
        descTh,
        descEn,
        price,
        salePrice,
        stock,
        categoryId,
        imageUrl,
        isFeatured,
      } = req.body ?? {};

      // validate ขั้นต่ำ
      if (!nameTh || !nameEn) {
        return res.status(400).json({ error: "กรุณาระบุชื่อสินค้า TH/EN" });
      }
      if (price == null || stock == null) {
        return res.status(400).json({ error: "กรุณาระบุราคาและสต็อก" });
      }

      // สร้างสินค้า + translations ภายใน transaction
      const created = await prisma.$transaction(async (tx) => {
        const p = await tx.product.create({
          data: {
            price: Number(price),
            salePrice:
              salePrice != null && salePrice !== "" ? Number(salePrice) : null,
            stock: Number(stock),
            imageUrl: imageUrl || null,
            isFeatured: !!isFeatured,
            categoryId: categoryId || null,
          },
        });

        // ผูกชื่อ/คำบรรยายตาม locale (schema มี ProductLocale)
        await tx.productLocale.create({
          data: {
            productId: p.id,
            locale: "th",
            name: String(nameTh),
            description: descTh ? String(descTh) : null,
          },
        });
        await tx.productLocale.create({
          data: {
            productId: p.id,
            locale: "en",
            name: String(nameEn),
            description: descEn ? String(descEn) : null,
          },
        });

        return p;
      });

      // ส่งกลับข้อมูลหลัก + translations (เอาไว้ให้หน้าบ้านรีเฟรช)
      const full = await prisma.product.findUnique({
        where: { id: created.id },
        include: { translations: true, category: true },
      });

      return res.status(201).json(full);
    } catch (err: any) {
      console.error("POST /api/products error:", err);
      return res
        .status(500)
        .json({ error: err?.message || "Internal Server Error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

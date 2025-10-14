// pages/api/admin/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromReq } from "@/lib/auth";
import formidable, { type File } from "formidable";
import path from "path";
import fs from "fs/promises";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Cannot parse form data" });
    }

    try {
      // ✅ ตรวจ user จากคุกกี้ HttpOnly
      const user = await getSessionUserFromReq(req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const first = (v: any): string | null =>
        Array.isArray(v) ? v[0] ?? null : (v ?? null);

      // -------- Address & Payment --------
      const recipient = first(fields.recipient);
      const line1 = first(fields.line1);
      const line2 = first(fields.line2);
      const line3 = first(fields.line3);
      const city = first(fields.city);
      const postalCode = first(fields.postalCode);
      const country = first(fields.country);
      const paymentMethod = first(fields.paymentMethod);
      const couponCode = first(fields.couponCode);

      if (!recipient || !line1 || !city || !country || !paymentMethod) {
        return res.status(400).json({ error: "Missing required address or payment fields" });
      }

      // -------- Items --------
      const rawItems = fields.items;
      const itemsStr =
        typeof rawItems === "string"
          ? rawItems
          : Array.isArray(rawItems) && typeof rawItems[0] === "string"
          ? rawItems[0]
          : null;

      if (!itemsStr) return res.status(400).json({ error: "Missing order items" });

      const items: { productId: string; quantity: number; priceAtPurchase: number }[] =
        JSON.parse(itemsStr);

      const localeParam = req.query.locale;
      const locale =
        typeof localeParam === "string" && (localeParam === "th" || localeParam === "en")
          ? localeParam
          : "th";

      // ตรวจสต็อก
      for (const it of items) {
        const p = await prisma.product.findUnique({
          where: { id: it.productId },
          select: {
            stock: true,
            translations: { where: { locale }, take: 1, select: { name: true } },
          },
        });
        if (!p) return res.status(400).json({ error: `ไม่พบสินค้า id: ${it.productId}` });
        const name = p.translations[0]?.name ?? "Unknown";
        if (p.stock < it.quantity) {
          return res.status(400).json({ error: `สต็อกสินค้า ${name} ไม่เพียงพอ` });
        }
      }

      // -------- ยอดรวม / คูปอง --------
      const totalAmount = items.reduce(
        (sum, it) => sum + it.priceAtPurchase * it.quantity,
        0
      );

      let discountValue = 0;
      let couponId: string | null = null;
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
        if (coupon) {
          couponId = coupon.id;
          discountValue =
            coupon.discountType === "percent"
              ? (totalAmount * (coupon.discountValue ?? 0)) / 100
              : coupon.discountValue ?? 0;
        }
      }
      const totalAfterDiscount = Math.max(totalAmount - discountValue, 0);

      // -------- สลิป (ไฟล์/URL) --------
      let slipUrl: string | null = null;
      const rawFileField = (files.slipFile ?? files.slipUrl) as File | File[] | undefined;
      const file = Array.isArray(rawFileField) ? rawFileField[0] : rawFileField;

      if (file && (file as any).filepath) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
        await fs.mkdir(uploadDir, { recursive: true });
        const orig = (file as any).originalFilename || "slip.jpg";
        const ext = path.extname(orig);
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const dest = path.join(uploadDir, filename);
        await fs.rename((file as any).filepath, dest);
        slipUrl = `/uploads/slips/${filename}`;
      } else if (typeof fields.slipUrl === "string") {
        slipUrl = fields.slipUrl;
      }

      // -------- Transaction: สร้างออเดอร์ + ตัดสต็อก + เคลียร์ตะกร้า (ลบ cartItem ก่อน cart) --------
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: user.id,
            recipient,
            line1,
            line2,
            line3,
            city,
            postalCode,
            country,
            paymentMethod,
            slipUrl,
            totalAmount: totalAfterDiscount,
            couponId: couponId ?? undefined,
            items: {
              create: items.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                priceAtPurchase: it.priceAtPurchase,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    translations: { where: { locale }, take: 1, select: { name: true } },
                  },
                },
              },
            },
          },
        });

        // ตัดสต็อก
        for (const it of items) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.quantity } },
          });
        }

        // ✅ เคลียร์ตะกร้าแบบถูกลำดับ
        await tx.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
        await tx.cart.deleteMany({ where: { userId: user.id } });

        return created;
      });

      // map ชื่อสินค้าตาม locale สำหรับ response
      const result = {
        ...order,
        items: order.items.map((it) => ({
          ...it,
          product: {
            ...it.product,
            name: it.product.translations[0]?.name ?? "Unknown",
          },
        })),
      };

      return res.status(201).json(result);
    } catch (e: any) {
      console.error("Create order error:", e);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ" });
    }
  });
}

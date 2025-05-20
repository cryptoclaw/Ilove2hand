// pages/api/banners/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

// 1) ปิด bodyParser ของ Next.js เพื่อให้ multer อ่าน multipart/form-data ได้
export const config = { api: { bodyParser: false } };

// 2) ตั้งค่า multer ให้บันทึกรูปลง public/uploads/banners
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/banners",
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
});

// 3) wrapper ให้ multer ทำงานแบบ promise-friendly
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) =>
    fn(req, res, (err: any) => (err ? reject(err) : resolve()))
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // เรียก multer middleware ก่อนเสมอ
  await runMiddleware(req, res, upload.single("image"));

  if (req.method === "GET") {
    // GET /api/banners → คืนรายการ banner ทั้งหมด
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return res.status(200).json({ items: banners });
  }

  if (req.method === "POST") {
    // POST /api/banners → สร้าง banner ใหม่
    const file = (req as any).file as Express.Multer.File | undefined;
    const { title, sub, order } = req.body as {
      title?: string;
      sub?: string;
      order?: string;
    };

    // ตรวจแค่ image (title/sub เป็น optional)
    if (!file) {
      return res.status(400).json({ error: "ต้องระบุรูปภาพ (field: image)" });
    }

    const imageUrl = `/uploads/banners/${file.filename}`;
    const orderNum = parseInt(order ?? "0", 10) || 0;

    try {
      const banner = await prisma.banner.create({
        data: {
          title: title?.trim() || null,
          sub: sub?.trim() || null,
          imageUrl,
          order: orderNum,
        },
      });
      return res.status(201).json(banner);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Method not allowed
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

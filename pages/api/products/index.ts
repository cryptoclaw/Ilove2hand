// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

// 1) ปิด bodyParser ของ Next.js เพื่อให้ multer อ่าน multipart/form-data ได้
export const config = { api: { bodyParser: false } };

// 2) ตั้งค่า multer ให้บันทึกรูปลง public/uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB
});

// 3) wrapper สำหรับเรียก middleware ให้เป็น Promise
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve();
    });
  });
}

// 4) handler หลัก
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // เรียก multer ก่อนเสมอ
  await runMiddleware(req, res, upload.single("image"));

  if (req.method === "GET") {
    // GET /api/products
    const items = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    // POST /api/products
    console.log("BODY >>>", req.body);
    console.log("FILE >>>", (req as any).file);

    const file = (req as any).file as Express.Multer.File | undefined;
    const {
      name,
      description,
      price: priceRaw,
      stock: stockRaw,
      categoryId,
    } = req.body as Record<string, string>;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const price = parseFloat(priceRaw);
    const stock = parseInt(stockRaw, 10);
    if (isNaN(price) || isNaN(stock)) {
      return res.status(400).json({ error: "Invalid price or stock" });
    }

    const imageUrl = file ? `/uploads/${file.filename}` : null;
    const data: any = {
      name,
      description: description || null,
      price,
      stock,
      imageUrl,
    };
    if (categoryId) data.categoryId = categoryId;

    try {
      const product = await prisma.product.create({ data });
      return res.status(201).json(product);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ถ้าไม่ใช่ GET/POST
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

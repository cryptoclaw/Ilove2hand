// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

// 1. ตั้งค่า multer ให้เขียนไฟล์ลง public/uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// 2. ปิด Next.js body parser
export const config = { api: { bodyParser: false } };

// 3. นำเข้า next-connect แบบ CommonJS
const nextConnect = require("next-connect");

// 4. สร้าง handler (ไม่มี <...> เพื่อเลี่ยง error)
const handler = nextConnect({
  onError(error: any, _req: NextApiRequest, res: NextApiResponse) {
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  },
  onNoMatch(_req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method ${_req.method} Not Allowed` });
  },
});

// 5. ติดตั้ง multer middleware
handler.use(upload.single("image"));

// 6. GET /api/products
handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const items = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json({ items });
});

// 7. POST /api/products
handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  const { name, description, price, stock } = req.body;
  const imageUrl = file ? `/uploads/${file.filename}` : null;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl,
      },
    });
    return res.status(201).json(product);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default handler;

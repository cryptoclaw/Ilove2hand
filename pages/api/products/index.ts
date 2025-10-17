// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

// ---- Multer storage ----
const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise<void>((resolve, reject) =>
    fn(req as any, res as any, (err: any) => (err ? reject(err) : resolve()))
  );
}

function isMultipart(req: NextApiRequest) {
  return (req.headers["content-type"] || "").includes("multipart/form-data");
}

async function readJsonBody(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", reject);
  });
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ---------------- GET ----------------
  if (req.method === "GET") {
    const raw = await prisma.product.findMany({
      include: { category: true, translations: true },
      orderBy: { createdAt: "desc" },
    });

    const items = raw.map((p) => {
      const th = p.translations.find((t) => t.locale === "th");
      const en = p.translations.find((t) => t.locale === "en");
      return {
        id: p.id,
        nameTh: th?.name ?? "",
        nameEn: en?.name ?? "",
        descTh: th?.description ?? "",
        descEn: en?.description ?? "",
        price: p.price,
        salePrice: p.salePrice,
        stock: p.stock,
        imageUrl: p.imageUrl,
        category: p.category,
        isFeatured: p.isFeatured,
      };
    });

    return res.status(200).json({ items });
  }

  // ---------------- POST ----------------
  if (req.method === "POST") {
    let body: any = {};
    let filePath: string | null = null;

    if (isMultipart(req)) {
      // รับแบบ multipart
      await runMiddleware(req, res, upload.single("image"));
      const anyReq = req as any;
      body = anyReq.body || {};
      const file = anyReq.file as Express.Multer.File | undefined;
      if (file) filePath = `/uploads/products/${file.filename}`;
    } else {
      // รับแบบ JSON (เพราะปิด bodyParser ไว้ ต้องอ่านเอง)
      body = await readJsonBody(req);
      // ในเคสนี้จะไม่ได้อัปไฟล์, อาจส่ง imageUrl มาแทน
      filePath = null;
    }

    const {
      nameTh,
      nameEn,
      descTh,
      descEn,
      price,
      salePrice,
      stock,
      categoryId,
      imageUrl, // เผื่อส่งมาในโหมด JSON
    } = body;

    if (!nameTh || price == null) {
      return res
        .status(400)
        .json({ error: "ต้องระบุชื่อสินค้า (TH) และราคา" });
    }

    const finalImageUrl = filePath || imageUrl || null;

    try {
      const created = await prisma.product.create({
        data: {
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          stock: Number(stock) || 0,
          imageUrl: finalImageUrl,
          ...(categoryId
            ? { category: { connect: { id: String(categoryId) } } }
            : {}),
          translations: {
            create: [
              { locale: "th", name: String(nameTh), description: String(descTh || "") },
              { locale: "en", name: String(nameEn || ""), description: String(descEn || "") },
            ],
          },
        },
        include: { translations: true, category: true },
      });

      const th = created.translations.find((t) => t.locale === "th");
      const en = created.translations.find((t) => t.locale === "en");

      return res.status(201).json({
        id: created.id,
        nameTh: th?.name ?? "",
        nameEn: en?.name ?? "",
        descTh: th?.description ?? "",
        descEn: en?.description ?? "",
        price: created.price,
        salePrice: created.salePrice,
        stock: created.stock,
        imageUrl: created.imageUrl,
        category: created.category,
        isFeatured: created.isFeatured,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

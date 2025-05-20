// pages/api/banners/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";

// หยุด bodyParser เพื่อให้ multer ทำงาน
export const config = { api: { bodyParser: false } };

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/banners",
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) =>
    fn(req, res, (result: any) =>
      result instanceof Error ? reject(result) : resolve(undefined)
    )
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, upload.single("image"));

  if (req.method === "GET") {
    const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
    return res.status(200).json({ items: banners });
  }

  if (req.method === "POST") {
    const file = (req as any).file;
    const { title, sub, order } = req.body as {
      title: string;
      sub?: string;
      order?: string;
    };
    if (!title || !file)
      return res.status(400).json({ error: "ต้องระบุ title และ image" });
    const imageUrl = `/uploads/banners/${file.filename}`;
    const banner = await prisma.banner.create({
      data: {
        title,
        sub: sub || null,
        imageUrl,
        order: parseInt(order || "0", 10),
      },
    });
    return res.status(201).json(banner);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import multer from "multer";
import path from "path";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, _req, res) {
    res.status(500).json({ error: err.message || "Upload error" });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method Not Allowed" });
  },
});

handler.use(upload.single("file"));

handler.post((req: any, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file" });
  // URL ที่เสิร์ฟได้เลย
  const url = `/uploads/${file.filename}`;
  res.status(201).json({ url });
});

export default handler;

import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import multer from "multer"; // ถ้าไม่เปิด esModuleInterop: import * as multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage });

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, _req, res) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed" });
  },
});

handler.use(upload.single("file")); // เปลี่ยน "file" ให้ตรงชื่อ field ในฟอร์มถ้าจำเป็น

handler.post((req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file uploaded" });
  const publicUrl = `/uploads/${file.filename}`;
  return res.status(200).json({ url: publicUrl, filename: file.filename });
});

export default handler;

// ❗จำเป็นสำหรับ Multer
export const config = {
  api: { bodyParser: false },
};

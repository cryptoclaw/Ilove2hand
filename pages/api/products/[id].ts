// pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

type Parsed = {
  fields: Record<string, string>;
  files: Record<string, File>;
};

// ฟังก์ชันช่วย parse multipart/form-data
const parseForm = (req: NextApiRequest): Promise<Parsed> =>
  new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      // แปลง fields ทุกค่าเป็น string เดียว
      const flds: Record<string, string> = {};
      for (const key in fields) {
        const val = fields[key];
        flds[key] = Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
      }
      // Normalize files: always single File, never array or undefined
      const normalizedFiles: Record<string, File> = {};
      for (const key in files) {
        const file = files[key];
        if (Array.isArray(file)) {
          if (file[0]) normalizedFiles[key] = file[0];
        } else if (file) {
          normalizedFiles[key] = file;
        }
      }
      resolve({ fields: flds, files: normalizedFiles });
    });
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Next.js query param อาจเป็น string|string[]|undefined
  const rawId = req.query.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : null;

  if (!id) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { productId: id } }),
        prisma.orderItem.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);
      return res.status(204).end();
    } catch (error: any) {
      console.error("Delete product error:", error);
      return res
        .status(500)
        .json({ error: "ไม่สามารถลบสินค้าได้ เนื่องจากมีข้อมูลอ้างอิงอยู่" });
    }
  }

  // PUT (อัปเดตสินค้า)
  if (req.method === "PUT") {
    try {
      const { fields, files } = await parseForm(req);

      // ตรวจสอบฟิลด์ที่จำเป็น
      if (!fields.name || !fields.price || !fields.stock) {
        return res
          .status(400)
          .json({ error: "name, price และ stock ต้องกำหนดทุกครั้ง" });
      }

      const name = fields.name;
      const description = fields.description ?? null;
      const price = parseFloat(fields.price);
      const stock = parseInt(fields.stock, 10);

      // แปลง salePrice ให้เป็น number หรือ null แน่นอน
      let salePrice: number | null = null;
      if (fields.salePrice?.trim()) {
        const sp = parseFloat(fields.salePrice);
        if (!isNaN(sp)) salePrice = sp;
      }

      const updateData: Record<string, any> = {
        name,
        description,
        price,
        stock,
        salePrice,
      };

      // ถ้ามีไฟล์รูปใหม่ ให้อัปเดต imageUrl ด้วย
      if (files.image) {
        const file = Array.isArray(files.image)
          ? files.image[0]
          : files.image;
        const tmpPath = (file.filepath || (file as any).path) as string;
        const fileName = path.basename(tmpPath);
        updateData.imageUrl = `/uploads/${fileName}`;
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(updated);
    } catch (error: any) {
      console.error("Update product error:", error);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการแก้ไขสินค้า" });
    }
  }

  // อนุญาตเฉพาะ DELETE และ PUT
  res.setHeader("Allow", ["DELETE", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

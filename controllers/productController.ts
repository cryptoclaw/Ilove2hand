// controllers/productController.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../lib/prisma";

export async function listProducts(req: NextApiRequest, res: NextApiResponse) {
  const items = await prisma.product.findMany();
  res.status(200).json({ items });
}

export async function getProductById(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const item = await prisma.product.findUnique({
    where: { id: id as string },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.status(200).json(item);
}

export async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, description, price, stock, categoryId, imageUrl } = req.body;

  // ✅ ตรวจสอบค่าเบื้องต้น (กันข้อมูลผิดรูป)
  if (!name || price == null || stock == null) {
    return res.status(422).json({ error: "name, price, stock เป็นค่าบังคับ" });
  }

  const priceNum =
    typeof price === "string" ? parseFloat(price) : Number(price);
  const stockNum =
    typeof stock === "string" ? parseInt(stock, 10) : Number(stock);

  if (Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
    return res.status(422).json({ error: "price/stock ต้องเป็นตัวเลข" });
  }

  try {
    // ✅ สร้าง payload ให้ “ตรง schema” เท่านั้น
    // - สมมติ schema ใช้ฟิลด์ 'title' แทน 'name'
    // - ถ้า schema ของคุณใช้ชื่ออื่น ให้เปลี่ยน key ด้านซ้ายให้ตรงได้เลย
    const data: any = {
      title: name, // เปลี่ยน map name -> title
      description, // ต้องมีจริงใน schema
      price: priceNum, // ถ้า field เป็น Decimal แล้วอยากเข้มขึ้น: new Prisma.Decimal(priceNum)
      stock: stockNum, // ต้องมีจริงใน schema
    };

    // ถ้า schema มี imageUrl ให้ใส่ (ลบส่วนนี้ถ้า schema ไม่มี)
    if (imageUrl) data.imageUrl = imageUrl;

    // ถ้ามีความสัมพันธ์กับ Category และ schema มีฟิลด์ categoryId หรือ relation ชื่อ category:
    // - แบบเก็บเป็น FK ตรง ๆ: data.categoryId = categoryId
    // - แบบ relation: data.category = { connect: { id: categoryId } }
    if (categoryId) {
      // แก้ให้ตรงกับ schema ของคุณ (เลือกอย่างใดอย่างหนึ่ง)
      // data.categoryId = categoryId;
      // หรือ:
      // data.category = { connect: { id: categoryId } };
    }

    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Create product failed" });
  }
}

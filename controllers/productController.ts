// controllers/productController.ts
import { prisma } from "../lib/prisma";

export async function listProducts(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  const items = await prisma.product.findMany();
  res.status(200).json({ items });
}

export async function getProductById(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  const { id } = req.query;
  const item = await prisma.product.findUnique({
    where: { id: id as string },
  });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.status(200).json(item);
}

export async function createProduct(
  req: import("next").NextApiRequest,
  res: import("next").NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { name, description, price, stock, categoryId, imageUrl } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        // ถ้าไม่มีหมวดหมู่หรือรูป ให้ตัดสองบรรทัดนี้ออก
        categoryId: categoryId || undefined,
        imageUrl: imageUrl || undefined,
      },
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/* models/productModel.ts */
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export async function findAllProducts(): Promise<Product[]> {
  return prisma.product.findMany();
}

export async function findProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

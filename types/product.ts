// types/product.ts

// ฟิลด์เดียวกับ Prisma model ของคุณ
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock: number;
  salePrice?: number | null;
  categoryId?: string; // ถ้าใช้ filter by category
}

// เพิ่ม Category interface
export interface Category {
  id: string;
  name: string;
}

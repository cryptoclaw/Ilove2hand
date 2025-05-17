// types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock: number;
  salePrice?: number | null;
}

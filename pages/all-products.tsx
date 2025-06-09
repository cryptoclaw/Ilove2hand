// pages/all-products.tsx
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product, Category } from "@/types/product";

interface AllProductsProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  discount: boolean;
}

export default function AllProductsPage({
  products,
  categories,
  selectedCategory,
  discount,
}: AllProductsProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // ควบคุม search term
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // เปลี่ยนหมวดหมู่ พร้อมคงสถานะ discount ถ้ามี
  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    const params = new URLSearchParams();
    if (discount) params.set("discount", "1");
    if (cat) params.set("category", cat);
    router.push(`/all-products?${params.toString()}`);
  };

  // กรองตามชื่อ + discount ถ้ามี (แต่ฝั่ง server ก็กรองให้แล้วนี่)
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title={discount ? "สินค้าลดราคา" : "สินค้าทั้งหมด"}>
      <h1 className="text-3xl font-bold mb-4">
        {discount ? "สินค้าลดราคา" : "สินค้าทั้งหมด"}
      </h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="ค้นหาสินค้า..."
          className="flex-1 border rounded p-2"
        />
        <select
          value={selectedCategory ?? ""}
          onChange={handleCategoryChange}
          className="border rounded p-2"
        >
          <option value="">-- ทุกหมวดหมู่ --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {filtered.length > 0 ? (
          filtered.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            ไม่พบสินค้าตามเงื่อนไข
          </p>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<AllProductsProps> = async ({
  query,
}) => {
  const selectedCategory =
    typeof query.category === "string" ? query.category : null;
  const discount = query.discount === "1";

  // ดึงหมวดหมู่ทั้งหมด
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // สร้าง where เงื่อนไขให้ดึงสินค้า
  const whereClause: any = {};
  if (selectedCategory) {
    whereClause.categoryId = selectedCategory;
  }
  if (discount) {
    // ถ้าใช้ flag isOnSale ให้เปลี่ยนเป็น { isOnSale: true }
    whereClause.salePrice = { not: null };
  }

  // ดึงสินค้า
  const rawProducts = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });
  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
    categoryId: p.categoryId ?? "",
    isFeatured: p.isFeatured ?? false,
  }));

  return {
    props: {
      products,
      categories,
      selectedCategory,
      discount,
    },
  };
};

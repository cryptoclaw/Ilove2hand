// pages/all-products.tsx
import { GetServerSideProps } from "next";
import { useState, ChangeEvent } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product, Category } from "@/types/product";

interface AllProductsProps {
  products: Product[];
  categories: Category[];
}

export default function AllProductsPage({
  products,
  categories,
}: AllProductsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  // อัปเดต search term
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // อัปเดตหมวดหมู่ที่เลือก
  const handleCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCat(e.target.value);
  };

  // กรองสินค้า by name + category
  const filtered = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat ? p.categoryId === selectedCat : true;
    return matchesName && matchesCat;
  });

  return (
    <Layout title="สินค้าทั้งหมด">
      <h1 className="text-3xl font-bold mb-4">สินค้าทั้งหมด</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="ค้นหาสินค้า..."
          className="flex-1 border rounded p-2 focus:outline-none focus:ring"
        />

        {/* Category filter */}
        <select
          value={selectedCat}
          onChange={handleCategory}
          className="border rounded p-2 focus:outline-none focus:ring"
        >
          <option value="">-- ทุกหมวดหมู่ --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.length > 0 ? (
          filtered.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            ไม่พบสินค้า "{searchTerm}"
          </p>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<
  AllProductsProps
> = async () => {
  // ดึงสินค้าทั้งหมด
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // ดึงหมวดหมู่ทั้งหมด
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // แมปข้อมูลให้ตรง type
  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
    categoryId: p.categoryId ?? "",
  }));

  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return {
    props: { products, categories },
  };
};

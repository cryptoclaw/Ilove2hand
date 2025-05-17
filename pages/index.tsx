// pages/index.tsx
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import Banner from "@/components/Banner";
import DiscountCarousel from "@/components/DiscountCarousel"; // <= นำเข้า
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types/product";

interface HomeProps {
  featured: Product[];
  onSale: Product[];
}

export default function HomePage({ featured, onSale }: HomeProps) {
  return (
    <Layout>
      {/* ส่วน Banner หลัก */}
      <Banner />

      {/* **ตรงนี้** เพิ่ม Banner สินค้าลดราคา */}
      <DiscountCarousel items={onSale} />

      {/* ส่วนสินค้าแนะนำ */}
      <h1 className="text-3xl font-bold mb-6">สินค้าแนะนำ</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ปุ่มดูสินค้าทั้งหมด */}
      <div className="text-center mt-8">
        <Link href="/all-products">
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
            ดูสินค้าทั้งหมด
          </button>
        </Link>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // ดึงสินค้าแนะนำ
  const rawFeatured = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // ดึงสินค้าลดราคา
  const rawOnSale = await prisma.product.findMany({
    where: { salePrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const featured: Product[] = rawFeatured.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
  }));

  const onSale: Product[] = rawOnSale.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice!,
  }));

  return {
    props: { featured, onSale },
  };
};

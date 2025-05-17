// pages/index.tsx
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock: number;
}

interface HomeProps {
  featured: Product[];
}

export default function HomePage({ featured }: HomeProps) {
  return (
    <Layout>
      <Banner />
      <h1 className="text-3xl font-bold mb-6">สินค้าแนะนำ</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
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
  const raw = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  const featured: Product[] = raw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
  }));
  return { props: { featured } };
};

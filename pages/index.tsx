// pages/index.tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
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
  products: Product[];
}

export default function HomePage({ products }: HomeProps) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">สินค้าทั้งหมด</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  const products: Product[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock ?? 0,
  }));
  return { props: { products } };
};

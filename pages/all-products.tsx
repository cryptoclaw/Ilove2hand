// pages/all-products.tsx
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

interface AllProductsProps {
  products: Product[];
}

export default function AllProductsPage({ products }: AllProductsProps) {
  return (
    <Layout title="All Products">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<
  AllProductsProps
> = async () => {
  const raw = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  const products: Product[] = raw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock ?? 0,
  }));
  return { props: { products } };
};

// pages/products/[id].tsx
"use client"; // ← บรรทัดสำคัญ!

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Product as ProductType } from "@/types/product";
import { useAuth } from "@/context/AuthContext";

interface ProductPageProps {
  product: ProductType & { createdAt: string; updatedAt: string };
}

export default function ProductPage({ product }: ProductPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const priceToUse = product.salePrice ?? product.price;

  const addToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });
    setLoading(false);
    if (res.ok) {
      alert("เพิ่มลงตะกร้าแล้ว!");
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.imageUrl || "/images/placeholder.png"}
          alt={product.name}
          className="w-full md:w-1/2 h-auto object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          {product.salePrice != null ? (
            <div className="mb-4">
              <span className="text-2xl text-red-600 font-bold mr-2">
                {product.salePrice} ฿
              </span>
              <span className="text-xl text-gray-500 line-through">
                {product.price} ฿
              </span>
            </div>
          ) : (
            <p className="text-xl text-green-700 mb-4">
              Price: {product.price} ฿
            </p>
          )}

          <p className="mb-4">Stock: {product.stock}</p>

          {/* ตัวเลือกจำนวน */}
          <div className="mb-4">
            <label className="mr-2">จำนวน:</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-16 border p-1 text-center"
            />
          </div>

          {/* ปุ่มเพิ่มลงตะกร้า */}
          <button
            onClick={addToCart}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "กำลังเพิ่ม..." : "เพิ่มลงในตะกร้า"}
          </button>

          <div className="mt-4">
            <Link href="/" className="text-blue-500 hover:underline">
              &larr; กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async ({
  params,
}) => {
  const id = params?.id as string;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { notFound: true };

  const product: ProductType & { createdAt: string; updatedAt: string } = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };

  return { props: { product } };
};

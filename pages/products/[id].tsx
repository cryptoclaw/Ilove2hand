// pages/products/[id].tsx
"use client";

import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // รีเซ็ต error ทุกครั้งที่ qty หรือ stock เปลี่ยน
  useEffect(() => {
    if (qty < 1) setQty(1);
    if (qty > product.stock) {
      setQty(product.stock);
      setError(`สั่งได้สูงสุด ${product.stock} ชิ้น`);
    } else {
      setError("");
    }
  }, [qty, product.stock]);

  const addToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (error) return; // ถ้ามี error หยุด
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "เพิ่มลงตะกร้าไม่สำเร็จ");
      }
      // ไปหน้าตะกร้า
      router.push("/cart");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={product.name}>
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <img
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              className="w-full h-auto object-cover rounded"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>

            {product.salePrice != null ? (
              <div className="mb-4">
                <span className="text-2xl text-red-600 font-bold mr-2">
                  ฿{product.salePrice}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ฿{product.price}
                </span>
              </div>
            ) : (
              <p className="text-xl text-green-700 mb-4">
                ฿{product.price}
              </p>
            )}

            <p className="mb-4">Stock: {product.stock}</p>

            <div className="mb-4">
              <label className="block mb-1">จำนวน:</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-center"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <button
              onClick={addToCart}
              disabled={loading || !!error}
              className={`px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${
                loading || error ? "opacity-50 cursor-not-allowed" : ""
              }`}
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

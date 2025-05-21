"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product & { stock: number }; // สมมติ product มี stock ด้วย
}

export default function ProductCard({ product }: ProductCardProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setAdding(true);

    try {
      // 1. เช็คจำนวนสินค้าที่อยู่ในตะกร้าก่อน
      const cartRes = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cartRes.ok) throw new Error("Cannot fetch cart");

      const cartData = await cartRes.json();
      const cartItems: { productId: string; quantity: number }[] = cartData.items || [];

      // 2. หา quantity ที่มีในตะกร้า
      const itemInCart = cartItems.find((item) => item.productId === product.id);
      const currentQuantity = itemInCart?.quantity ?? 0;

      // 3. เช็คจำนวน ถ้าเกิน stock หยุด
      if (currentQuantity + 1 > product.stock) {
        alert("จำนวนสินค้าเกินสต็อกที่มี");
        setAdding(false);
        return;
      }

      // 4. ถ้าไม่เกิน ก็เพิ่มสินค้าในตะกร้า
      const addRes = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (!addRes.ok) throw new Error("Failed to add to cart");

      router.push("/cart");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full max-w-[200px] bg-white border rounded-2xl p-3 flex flex-col text-center shadow-sm hover:shadow-lg transition">
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative w-full pt-[100%] rounded-lg overflow-hidden mb-3">
          <Image
            src={product.imageUrl ?? "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h3 className="text-black font-semibold text-lg mb-1 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-center space-x-2 mb-2">
          {product.salePrice != null ? (
            <>
              <span className="text-gray-400 line-through">฿{product.price}</span>
              <span className="text-red-600 font-bold">฿{product.salePrice}</span>
            </>
          ) : (
            <span className="text-green-600 font-bold">฿{product.price}</span>
          )}
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={adding}
        className={`mt-auto flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-full hover:bg-green-700 transition ${
          adding ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Plus size={16} />
        <span>{adding ? "กำลังเพิ่ม..." : "หยิบใส่รถเข็น"}</span>
      </button>
    </div>
  );
}

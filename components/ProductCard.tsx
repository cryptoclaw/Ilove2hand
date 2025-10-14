"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

type CartListItem = {
  id: string;
  quantity: number;
  product: { id: string };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();                // ✅ ใช้ user แทน token (คุกกี้ HTTP-only)
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      // ไม่ต้องใส่ Authorization header — เบราว์เซอร์จะส่งคุกกี้ token ให้เอง
      const cartRes = await fetch("/api/cart");
      if (!cartRes.ok) throw new Error("Cannot fetch cart");
      const { items } = (await cartRes.json()) as { items: CartListItem[] };

      // ✅ ในตะกร้า field เป็น item.product.id (ไม่ใช่ productId)
      const currentQuantity =
        items.find((i) => i.product?.id === product.id)?.quantity ?? 0;

      if (currentQuantity + 1 > product.stock) {
        alert("จำนวนสินค้าเกินสต็อกที่มี");
        setAdding(false);
        return;
      }

      const addRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // ไม่ต้อง Authorization
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (!addRes.ok) {
        const err = await addRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add to cart");
      }

      router.push("/cart");
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full max-w-[200px] h-full bg-white rounded-2xl p-4 flex flex-col space-y-4 transition-shadow duration-300 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="group flex-1 flex flex-col space-y-2 relative z-10">
        <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl ?? "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h3 className="text-base font-normal text-black text-left line-clamp-2 min-h-12 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-sm line-clamp-1 text-left min-h-5">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-start space-x-2 min-h-6 mt-auto">
          {product.salePrice != null ? (
            <>
              <span className="text-gray-400 line-through text-sm font-normal">฿{product.price}</span>
              <span className="text-red-600 text-lg font-normal">฿{product.salePrice}</span>
            </>
          ) : (
            <span className="text-black text-lg font-normal">฿{product.price}</span>
          )}
        </div>
      </Link>

      {product.stock === 0 ? (
        <button disabled className="mt-2 w-full py-2 sm:py-3 rounded-full bg-gray-300 text-gray-700 cursor-not-allowed">
          สินค้าหมด
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`mt-2 w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 sm:py-3 text-sm sm:text-base rounded-full hover:bg-green-700 transition ${adding ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Plus size={16} />
          <span>{adding ? "กำลังเพิ่ม..." : "หยิบใส่รถเข็น"}</span>
        </button>
      )}
    </div>
  );
}

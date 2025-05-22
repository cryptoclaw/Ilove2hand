// components/DiscountCarousel.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface Props {
  items: Array<Product & { stock: number }>;
}

export default function DiscountCarousel({ items }: Props) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const displayCount = Math.min(6, total);
  const { token } = useAuth();
  const router = useRouter();
  const [addingId, setAddingId] = useState<string | null>(null);

  if (total === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const visible = Array.from({ length: displayCount }, (_, i) => {
    const index = (idx + i) % total;
    return items[index];
  });

  const handleAdd = async (
    e: React.MouseEvent,
    p: Product & { stock: number }
  ) => {
    e.stopPropagation();
    if (p.stock === 0) return;
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(p.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: p.id, quantity: 1 }),
      });
      if (res.ok) router.push("/cart");
    } catch {
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="relative rounded-2xl px-6 py-8 my-8 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 border-2 border-orange-500">
      <h2 className="absolute -top-3 left-8 bg-white px-2 text-lg font-semibold text-red-600 shadow-md rounded-full">
        สินค้าลดราคา
      </h2>

      {/* ปุ่มเลื่อนซ้าย */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-white transition z-20"
      >
        <ChevronLeft size={20} className="text-orange-600" />
      </button>

      {/* แสดงสินค้า */}
      <div className="grid grid-cols-6 gap-6">
        {visible.map((p) => (
          <div
            key={p.id}
            onClick={() => p.stock > 0 && router.push(`/products/${p.id}`)}
            className="cursor-pointer bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center hover:shadow-lg transition"
          >
            {/* Image + Sold Out badge */}
            <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden">
              <Image
                src={p.imageUrl ?? "/images/placeholder.png"}
                alt={p.name}
                fill
                className="object-cover"
              />
              {p.stock === 0 && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-red-600 font-bold">
                  สินค้าหมด
                </div>
              )}
            </div>

            {/* Name & description */}
            <h3 className="text-gray-800 font-medium mb-1">{p.name}</h3>
            {p.description && (
              <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                {p.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-3 flex items-center justify-center space-x-2">
              {p.salePrice != null && (
                <span className="text-gray-400 line-through text-sm">
                  ฿{p.price}
                </span>
              )}
              <span className="text-red-600 font-bold">
                ฿{p.salePrice ?? p.price}
              </span>
            </div>

            {/* Add button */}
            <button
              onClick={(e) => handleAdd(e, p)}
              disabled={addingId === p.id || p.stock === 0}
              className={`mt-auto flex items-center justify-center p-2 rounded-full shadow transition disabled:opacity-50 ${
                p.stock === 0
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {addingId === p.id ? "กำลังเพิ่ม..." : <Plus size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* ปุ่มเลื่อนขวา */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-white transition z-20"
      >
        <ChevronRight size={20} className="text-orange-600" />
      </button>
    </div>
  );
}

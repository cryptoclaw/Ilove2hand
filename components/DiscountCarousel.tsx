// components/DiscountCarousel.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface Props {
  items: Product[];
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

  const handleAdd = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) router.push("/cart");
    } catch (err) {
      console.error(err);
    }
    setAddingId(null);
  };

  return (
    <div
      className="
        relative
        rounded-2xl
        px-6 py-8 my-8
        bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400
        border-2 border-orange-500
      "
    >
      {/* หัวข้อ */}
      <h2
        className="
          absolute -top-3 left-8
          bg-white px-2 text-lg font-semibold text-red-600
          shadow-md rounded-full
        "
      >
        สินค้าลดราคา
      </h2>

      {/* ปุ่มเลื่อนซ้าย */}
      <button
        onClick={prev}
        className="
          absolute left-4 top-1/2 -translate-y-1/2
          bg-white p-2 rounded-full shadow
          hover:bg-white transition
        "
      >
        <ChevronLeft size={20} className="text-orange-600" />
      </button>

      {/* แสดงสินค้า 6 ชิ้นเต็มแถว */}
      <div className="grid grid-cols-6 gap-6">
        {visible.map((p) => (
          <div
            key={p.id}
            onClick={() => router.push(`/products/${p.id}`)}
            className="
              cursor-pointer bg-white rounded-xl border shadow-sm
              p-4 flex flex-col items-center text-center
              hover:shadow-lg transition
            "
          >
            <div className="w-full h-24 mb-3 relative">
              <Image
                src={p.imageUrl ?? "/images/placeholder.png"}
                alt={p.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">{p.name}</h3>
            {p.description && (
              <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                {p.description}
              </p>
            )}
            {/* สลับที่ราคา: ราคาเต็ม (ขีดฆ่า) ก่อน แล้วตามด้วยราคาลด */}
            <div className="mb-3 flex items-center justify-center space-x-2">
              {p.salePrice && (
                <span className="text-gray-400 line-through text-sm">
                  ฿{p.price}
                </span>
              )}
              <span className="text-red-600 font-bold">
                ฿{p.salePrice ?? p.price}
              </span>
            </div>
            <button
              onClick={(e) => handleAdd(e, p.id)}
              disabled={addingId === p.id}
              className="
                mt-auto bg-orange-500 hover:bg-orange-600
                text-white p-2 rounded-full shadow
                transition disabled:opacity-50
              "
            >
              {addingId === p.id ? "กำลังเพิ่ม..." : <Plus size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* ปุ่มเลื่อนขวา */}
      <button
        onClick={next}
        className="
          absolute right-4 top-1/2 -translate-y-1/2
          bg-white p-2 rounded-full shadow
          hover:bg-white transition
        "
      >
        <ChevronRight size={20} className="text-orange-600" />
      </button>
    </div>
  );
}

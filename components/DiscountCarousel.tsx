// components/DiscountCarousel.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

interface Props {
  items: Product[];
}

export default function DiscountCarousel({ items }: Props) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const displayCount = Math.min(4, total);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  if (total === 0) return null;

  // สร้างอาเรย์ขนาด displayCount ของไอเท็มใหม่โดยใช้ modulo
  const visible = Array.from({ length: displayCount }, (_, i) => {
    const index = (idx + i) % total;
    return items[index];
  });

  return (
    <div className="border-2 border-green-600 rounded-xl p-6 relative bg-white my-6">
      <h2 className="text-2xl font-bold mb-4 text-center">สินค้าลดราคา</h2>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
      >
        ◀
      </button>

      <div className="flex space-x-4 overflow-hidden">
        {visible.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-4 flex flex-col items-center"
          >
            <Link href={`/products/${p.id}`} className="mb-2">
              <div className="relative w-32 h-32">
                <Image
                  src={p.imageUrl ?? "/images/placeholder.png"}
                  alt={p.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            </Link>
            <h3 className="mt-2 text-center font-medium">{p.name}</h3>
            <div className="mt-1 text-red-600 font-bold">
              {p.salePrice} ฿{" "}
              <span className="text-sm line-through text-gray-500">
                {p.price} ฿
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
      >
        ▶
      </button>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryCarouselProps {
  /** หมวดหมู่ อาจมา undefined ได้ ให้ default เป็น [] */
  categories?: Category[];
}

export default function CategoryCarousel({
  categories = [], // ใส่ default ให้ไม่พัง
}: CategoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (delta: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative py-4">
      {/* ปุ่มเลื่อนซ้าย */}
      <button
        onClick={() => scroll(-200)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      {/* แถบเลื่อนหมวดหมู่ */}
      <div ref={containerRef} className="flex space-x-4 overflow-x-auto px-10">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/all-products?category=${cat.id}`}
            className="flex-shrink-0 bg-white rounded-lg shadow px-4 py-2 hover:bg-green-50 transition"
          >
            <span className="text-sm text-gray-700">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* ปุ่มเลื่อนขวา */}
      <button
        onClick={() => scroll(200)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>
    </div>
  );
}

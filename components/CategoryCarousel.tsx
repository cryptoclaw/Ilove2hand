// components/CategoryCarousel.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryCarouselProps {
  categories?: Category[];
  scrollStep?: number; // px ต่อครั้งที่กดปุ่ม (default 280)
}

export default function CategoryCarousel({
  categories = [],
  scrollStep = 280,
}: CategoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // ตรวจว่าล้นหรือไม่ + ตำแหน่งซ้าย/ขวา
  const recompute = () => {
    const el = trackRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setIsOverflow(overflow);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  };

  useEffect(() => {
    recompute();
    const el = trackRef.current;

    // ติดตามเมื่อ resize และเมื่อคอนเทนต์เปลี่ยนขนาด
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | null = null;
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => recompute());
      ro.observe(el);
    }

    const onScroll = () => recompute();
    el?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      el?.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const delta = dir === "left" ? -scrollStep : scrollStep;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // ถ้าไม่ล้น: แสดงเป็นแถวเดียว (wrap) ไม่มีปุ่ม/สกรอลล์
  if (!isOverflow) {
    return (
      <div className="bg-transparent">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/all-products?category=${cat.id}`}
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-sm font-medium text-gray-800">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ล้น: ใช้สไลด์แนวนอน + ปุ่มเลื่อน + edge fade
  return (
    <div className="relative">
      {/* edge fade */}
      {!atStart && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent" />
      )}
      {!atEnd && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />
      )}

      {/* ปุ่มซ้าย */}
      {!atStart && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll categories left"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow hover:shadow-lg transition"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
      )}

      {/* แทร็กเลื่อน */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto px-10 py-1 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/all-products?category=${cat.id}`}
            className="snap-start flex-shrink-0 rounded-xl border border-gray-100 bg-white px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* ปุ่มขวา */}
      {!atEnd && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll categories right"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow hover:shadow-lg transition"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      )}
    </div>
  );
}

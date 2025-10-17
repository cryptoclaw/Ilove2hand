// components/DiscountCarousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Flame, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface Props {
  items: Array<Product & { stock: number }>;
  viewAllHref?: string; // ไม่ส่ง = ไม่แสดง
}

type CartListItem = { id: string; quantity: number; product: { id: string } };

const fmtTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);

export default function DiscountCarousel({ items, viewAllHref }: Props) {
  const total = items.length;
  const { user } = useAuth();
  const router = useRouter();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(2);
  const [idx, setIdx] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // responsive
  useEffect(() => {
    const updateCount = () => {
      const w = window.innerWidth;
      let count = 2;
      if (w < 640) count = 2;
      else if (w < 768) count = 3;
      else if (w < 1024) count = 4;
      else count = 6;
      setDisplayCount(Math.min(count, total));
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, [total]);

  // overflow state
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
    const onScroll = () => recompute();
    window.addEventListener("resize", recompute);
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", recompute);
      el?.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (total === 0) return null;

  // windowed items
  const visible = useMemo(
    () =>
      Array.from({ length: displayCount }, (_, i) => items[(idx + i) % total]),
    [displayCount, idx, items, total]
  );

  const prev = () => setIdx((i) => (i - displayCount + total) % total);
  const next = () => setIdx((i) => (i + displayCount) % total);

  const handleAdd = async (
    e: React.MouseEvent,
    p: Product & { stock: number }
  ) => {
    e.stopPropagation();
    if (p.stock === 0) return;
    if (!user) return router.push("/login");

    setAddingId(p.id);
    try {
      const cartRes = await fetch("/api/cart");
      if (!cartRes.ok) throw new Error("Cannot fetch cart");
      const { items: cartItems } = (await cartRes.json()) as {
        items: CartListItem[];
      };
      const currentQty =
        cartItems.find((i) => i.product?.id === p.id)?.quantity ?? 0;
      if (currentQty + 1 > p.stock) {
        alert("จำนวนสินค้าเกินสต็อกที่มี");
        return;
      }
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, quantity: 1 }),
      });
      if (res.ok) router.push("/cart");
      else throw new Error("Failed to add");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="relative my-10 rounded-2xl p-[1px] bg-gradient-to-br from-red-600 via-neutral-700 to-black shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
      {/* Header: Best Sellers vibe */}
      <div className="rounded-t-2xl bg-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-600 text-white">
            <Flame size={16} />
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900">
            ดีลลดราคาสุดฮอต
          </h2>
        </div>
        {viewAllHref && (
          <button
            onClick={() => router.push(viewAllHref)}
            className="rounded-md border border-red-600 bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
          >
            ดูทั้งหมด
          </button>
        )}
      </div>

      {/* Arrows (outside) */}
      {isOverflow && (
        <>
          {!atStart && (
            <button
              onClick={prev}
              aria-label="เลื่อนไปซ้าย"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white shadow hover:shadow-lg"
            >
              <ChevronLeft size={18} className="text-neutral-900" />
            </button>
          )}
          {!atEnd && (
            <button
              onClick={next}
              aria-label="เลื่อนไปขวา"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white shadow hover:shadow-lg"
            >
              <ChevronRight size={18} className="text-neutral-900" />
            </button>
          )}
        </>
      )}

      {/* Content */}
      <div className="rounded-b-2xl bg-white px-4 sm:px-6 py-6">
        <div ref={trackRef} className="">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {visible.map((p, i) => {
              const hasSale = p.salePrice != null && p.salePrice < p.price;
              const discount = hasSale
                ? Math.round(
                    ((p.price - (p.salePrice as number)) / p.price) * 100
                  )
                : 0;

              const topRank = i < 3 ? i + 1 : null; // Top 1-3 ของหน้า

              return (
                <div
                  key={p.id}
                  onClick={() =>
                    p.stock > 0 && router.push(`/products/${p.id}`)
                  }
                  className="group relative cursor-pointer rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm hover:shadow-md transition"
                >
                  {/* Top badge */}
                  {topRank && (
                    <div className="absolute -top-3 -right-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-1 text-xs font-extrabold text-black shadow">
                      <Crown size={14} className="text-yellow-700" />
                      TOP {topRank}
                    </div>
                  )}

                  <div className="relative w-full pt-[100%] overflow-hidden rounded-xl">
                    <Image
                      src={p.imageUrl ?? "/images/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* HOT ribbon when discount ≥ 40% */}
                    {discount >= 40 && (
                      <div className="absolute -left-9 top-4 rotate-[-35deg]">
                        <div className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-[11px] font-extrabold text-white shadow">
                          <Flame size={14} />
                          HOT
                        </div>
                      </div>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 grid place-items-center bg-white/80 text-red-600 font-bold">
                        สินค้าหมด
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-neutral-900">
                    {p.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    {hasSale && (
                      <span className="text-xs text-neutral-400 line-through">
                        {fmtTHB(p.price)}
                      </span>
                    )}
                    <span className="text-lg font-extrabold text-red-600">
                      {fmtTHB(hasSale ? (p.salePrice as number) : p.price)}
                    </span>
                    {hasSale && (
                      <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                        −{discount}%
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-[11px] text-neutral-500">
                    คงเหลือ {p.stock} ชิ้น
                  </div>

                  <button
                    onClick={(e) => handleAdd(e, p)}
                    disabled={addingId === p.id || p.stock === 0}
                    className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition
                      ${
                        p.stock === 0
                          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                          : "border border-red-600 bg-neutral-900 text-white hover:bg-red-600"
                      }`}
                    aria-label={`เพิ่ม ${p.name} ลงตะกร้า`}
                  >
                    {addingId === p.id ? "กำลังเพิ่ม..." : <Plus size={16} />}
                    {addingId === p.id ? null : "เพิ่มลงตะกร้า"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

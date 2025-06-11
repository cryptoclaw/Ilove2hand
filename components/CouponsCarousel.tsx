"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";

// Mirror your Prisma model
type Coupon = {
  id: string;
  code: string;
  discountType: "AMOUNT" | "PERCENT";
  discountValue: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string; // ISO date string
};

export default function CouponsCarousel() {
  const { data, isLoading, isError } = useQuery<{ items: Coupon[] }>(
    {
      queryKey: ["coupons"],
      queryFn: () =>
        fetch("/api/coupons")
          .then((res) => res.json()) as Promise<{ items: Coupon[] }>,
    }
  );

  const coupons = data?.items ?? [];

  if (isLoading) return <p>Loading coupons…</p>;
  if (isError)   return <p>ไม่สามารถโหลดคูปองได้</p>;

  function scroll(ev: MouseEvent, offset: number) {
    ev.preventDefault();
    document
      .getElementById("coupon-slider")
      ?.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => scroll(e, -300)}
        className="absolute left-0 top-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        <ArrowLeft size={20} />
      </button>

      <div
        id="coupon-slider"
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-4"
      >
        {coupons.map((c) => (
          <div key={c.id} className="min-w-[240px] flex-shrink-0 relative">
            <div className="bg-gray-800 text-white rounded-lg p-4 relative">
              {/* Copy code */}
              <button
                onClick={() => navigator.clipboard.writeText(c.code)}
                className="absolute top-2 right-3 text-sm underline"
              >
                Copy
              </button>

              {/* Discount label */}
              {c.discountType === "AMOUNT" ? (
                <h4 className="text-2xl font-bold mb-2">
                  ฿{c.discountValue} OFF
                </h4>
              ) : (
                <h4 className="text-2xl font-bold mb-2">
                  {c.discountValue}% OFF
                </h4>
              )}

              {/* Code line */}
              <p className="text-sm mb-1">กรอกโค้ด: {c.code}</p>

              {/* Optional: remaining usage */}
              {c.usageLimit != null && (
                <p className="text-xs text-gray-300 mb-0.5">
                  เหลือการใช้งาน {c.usageLimit - c.usedCount} ครั้ง
                </p>
              )}

              {/* Optional: expiration date */}
              {c.expiresAt && (
                <p className="text-xs text-gray-300">
                  หมดอายุ {new Date(c.expiresAt).toLocaleDateString("th-TH")}
                </p>
              )}
            </div>

            {/* Ticket-notch decoration */}
            <div className="absolute left-0 top-1/2 w-4 h-4 bg-white rounded-full -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute right-0 top-1/2 w-4 h-4 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
        ))}
      </div>

      <button
        onClick={(e) => scroll(e, +300)}
        className="absolute right-0 top-1/2 z-10 p-2 bg-white rounded-full shadow"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
}

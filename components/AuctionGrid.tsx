// components/AuctionGrid.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Clock, Users, Tag } from "lucide-react";

export type AuctionCardItem = {
  id: string;
  title: string;
  img: string | null;
  endsAt: string; // ISO
  currentPrice: number;
  biddersCount?: number;
};

const fmtTHB = (n: number) =>
  n.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  });

function useCountdown(iso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const end = new Date(iso).getTime();
    let diff = Math.max(end - now, 0);
    const isOver = diff === 0;
    const dd = Math.floor(diff / 86400000);
    diff -= dd * 86400000;
    const hh = Math.floor(diff / 3600000);
    diff -= hh * 3600000;
    const mm = Math.floor(diff / 60000);
    diff -= mm * 60000;
    const ss = Math.floor(diff / 1000);
    return { dd, hh, mm, ss, isOver };
  }, [iso, now]);
}

function TimeBadge({ iso }: { iso: string }) {
  const { dd, hh, mm, ss, isOver } = useCountdown(iso);
  if (isOver) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white">
        <Clock size={14} className="opacity-90" />
        ปิดแล้ว
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-black/75 px-2 py-1 text-white">
      <Clock size={14} className="opacity-90" />
      <span className="tabular-nums text-[13px] font-semibold">
        {dd > 0 ? `${dd}d ` : ""}
        {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}:
        {String(ss).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function AuctionGrid({ items }: { items: AuctionCardItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
        ยังไม่มีรายการประมูล
      </div>
    );
  }

  return (
    <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((a) => (
        <Link
          key={a.id}
          href={`/auctions/${a.id}`}
          className="group rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:border-red-600 transition"
        >
          <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-5">
            {/* ซ้าย: รูป (ให้เต็มความสูงการ์ดที่ breakpoint md+) */}
            <div className="relative w-full md:w-2/3 lg:w-[68%] rounded-xl overflow-hidden">
              {/* มือถือใช้ h-28/32, พอ >=md ให้สูงเท่าการ์ดด้วย h-full + กันเตี้ยเกินด้วย min-h */}
              <div className="relative w-full h-28 sm:h-32 md:h-full md:min-h-[140px]">
                <Image
                  src={a.img ?? "/images/placeholder.png"}
                  alt={a.title}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 66vw, 68vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute left-2 top-2">
                <TimeBadge iso={a.endsAt} />
              </div>
            </div>

            {/* ขวา: รายละเอียด */}
            <div className="flex-1 flex flex-col">
              <h4 className="line-clamp-2 text-[15px] md:text-lg font-semibold text-neutral-900">
                {a.title}
              </h4>

              <div className="mt-2 flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 w-fit text-[11px] md:text-[12px] text-neutral-700">
                <Users size={14} />
                <span className="tabular-nums">
                  {typeof a.biddersCount === "number"
                    ? `${a.biddersCount} คน`
                    : "—"}
                </span>
              </div>

              {/* ราคา + ปุ่ม (ไม่ชนกัน, ปุ่มไม่ตัดบรรทัด) */}
              <div className="mt-auto pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-red-600">
                    <Tag size={18} />
                    <span className="text-xl md:text-2xl font-extrabold leading-none">
                      {fmtTHB(a.currentPrice)}
                    </span>
                  </div>

                  <button
                    className="
                      rounded-xl border border-red-600
                      px-4 py-2 text-sm md:text-[15px] font-semibold
                      text-red-600 hover:bg-red-600 hover:text-white transition
                      whitespace-nowrap min-w-[90px] text-center
                    "
                  >
                    บิดเลย
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

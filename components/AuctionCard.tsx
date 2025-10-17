// components/AuctionCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  id: string;
  title: string;
  imageUrl?: string | null;
  currentPrice: number;
  bidsCount: number;
  endAt: string; // ISO
  className?: string;
};

function useCountdown(endISO: string) {
  const target = useMemo(() => new Date(endISO).getTime(), [endISO]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    done: diff === 0,
    label: `เหลือ ${d} วัน ${pad(h)}:${pad(m)}:${pad(s)}`,
  };
}

const fmtTHB = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 0 });

export default function AuctionCard({
  id,
  title,
  imageUrl,
  currentPrice,
  bidsCount,
  endAt,
  className = "",
}: Props) {
  const cd = useCountdown(endAt);
  const ended = cd.done;

  return (
    <article
      className={[
        "group h-full flex flex-col",
        "rounded-lg border border-black/10 bg-white shadow-sm overflow-hidden",
        "hover:shadow-md transition",
        "focus-within:ring-1 focus-within:ring-red-200",
        "relative text-[12px]",
        className,
      ].join(" ")}
    >
      {/* gradient เส้นใต้แบบเดียวกับ ProductCard */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 translate-y-[1px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0" />

      {/* คลิกได้ทั้งรูป + เนื้อหา */}
      <Link href={`/auctions/${id}`} className="flex flex-col flex-1">
        {/* รูป: ใช้ aspect-square + Next/Image เหมือน ProductCard */}
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={imageUrl ?? "/images/placeholder.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {ended && (
            <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              สิ้นสุดแล้ว
            </span>
          )}
        </div>

        {/* เนื้อหา */}
        <div className="p-2.5 flex flex-col gap-y-1 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-black line-clamp-2 min-h-[2.4rem]">
            {title}
          </h3>

          <div className="text-[11px] text-gray-600">
            จำนวนผู้ประมูล{" "}
            <span className="font-medium text-black">
              {bidsCount.toLocaleString()}
            </span>{" "}
            ครั้ง
          </div>

          <div
            className={[
              "mt-1 text-[11px]",
              ended ? "text-gray-400" : "text-gray-600 font-semibold",
            ].join(" ")}
          >
            {cd.label}
          </div>

          <div className="mt-1 text-center">
            <span className="text-xl font-semibold text-black">
              {fmtTHB(currentPrice)} บาท
            </span>
          </div>
        </div>
      </Link>

      {/* เส้นคั่นเหนือปุ่ม – สไตล์เดียวกัน */}
      <div className="mx-2.5 mb-2 rounded-full border-t border-gray-100" />

      {/* ปุ่มด้านล่างแบบเดียวกับ ProductCard */}
      <div className="px-2.5 pb-2.5">
        {ended ? (
          <button
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 py-1.5 text-[12px] font-semibold text-gray-500 cursor-not-allowed"
            onClick={(e) => e.preventDefault()}
          >
            สิ้นสุดแล้ว
          </button>
        ) : (
          <Link
            href={`/auctions/${id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-sm font-semibold bg-red-600 text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            ประมูลตอนนี้
          </Link>
        )}
      </div>
    </article>
  );
}

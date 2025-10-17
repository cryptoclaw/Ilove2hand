// pages/auctions/index.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AuctionCard from "@/components/AuctionCard";

type Item = {
  id: string;
  title: string;
  currentPrice: number;
  endAt: string; // ISO
  status: string;
  product?: { imageUrl?: string | null };
  bids: { id: string; amount: number }[];
};

export default function AuctionsIndex() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const url = q
      ? `/api/auctions?q=${encodeURIComponent(q)}`
      : "/api/auctions";
    fetch(url)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, [q]);

  return (
    <Layout title="ประมูล">
      {/* ❌ เอา container ออกให้เท่ากับ all-products */}
      <h1 className="mt-10 mb-4 text-2xl font-bold">รายการประมูล</h1>

      {/* Controls ให้สไตล์ใกล้เคียง all-products */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          className="flex-1 border rounded p-2"
          placeholder="ค้นหาสินค้า/ชื่อรายการ"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* ✅ ใช้คอลัมน์เท่ากับ all-products: 2 / 3 / 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {items.length > 0 ? (
          items.map((a) => (
            <AuctionCard
              key={a.id}
              id={a.id}
              title={a.title}
              imageUrl={a.product?.imageUrl ?? null}
              currentPrice={a.currentPrice}
              bidsCount={a.bids?.length ?? 0}
              endAt={a.endAt}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            ยังไม่มีรายการประมูล
          </p>
        )}
      </div>
    </Layout>
  );
}

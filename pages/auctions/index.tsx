// pages/auctions/index.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Item = {
  id: string;
  title: string;
  currentPrice: number;
  endAt: string;
  status: string;
  product?: { imageUrl?: string | null };
  bids: { id: string; amount: number }[];
};

export default function AuctionsIndex() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const url = q ? `/api/auctions?q=${encodeURIComponent(q)}` : '/api/auctions';
    fetch(url).then(r => r.json()).then(setItems).catch(console.error);
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auctions</h1>

      <input
        className="w-full border rounded-xl p-3"
        placeholder="ค้นหา..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(a => (
          <Link key={a.id} href={`/auctions/${a.id}`} className="border rounded-2xl p-4 hover:shadow">
            <div className="flex justify-between items-start">
              <h2 className="font-semibold">{a.title}</h2>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">฿{a.currentPrice.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ปิด: {new Date(a.endAt).toLocaleString()}
            </div>
            {a.product?.imageUrl ? (
              <img src={a.product.imageUrl} alt="" className="mt-3 rounded-xl h-36 w-full object-cover" />
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

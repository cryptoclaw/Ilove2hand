// pages/auctions/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

type Bid = {
  id: string;
  amount: number;
  createdAt: string;
  bidder?: { name?: string; email?: string };
};
type AuctionDetail = {
  id: string;
  title: string;
  description?: string | null;
  startPrice: number;
  currentPrice: number;
  bidIncrement: number;
  endAt: string;
  status: 'SCHEDULED'|'LIVE'|'ENDED'|'CANCELED';
  product?: { id: string; imageUrl?: string | null; price: number };
  bids: Bid[];
};

export default function AuctionDetailPage() {
  const router = useRouter();
  const { isReady, query } = router;

  const id = useMemo(() => {
    const raw = query?.id;
    if (!raw) return '';
    return Array.isArray(raw) ? raw[0] : raw;
  }, [query]);

  const [data, setData] = useState<AuctionDetail | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isReady || !id) return;
    let cancelled = false;
    setLoading(true); setErr(null); setNotFound(false);

    fetch(`/api/auctions/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) { const js = await r.json().catch(()=>({})); throw new Error(js.error || `Request failed (${r.status})`); }
        return r.json();
      })
      .then((js) => { if (!cancelled && js) setData(js); })
      .catch((e:any) => { if (!cancelled) setErr(String(e?.message||'Load failed')); })
      .finally(()=>{ if(!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isReady, id]);

  if (!isReady || loading) return <div className="p-6">Loading…</div>;
  if (notFound) return <div className="p-6">Auction not found.</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const top = data.bids[0] || null;
  const topName = top?.bidder?.name || top?.bidder?.email || null;
  const minRequired = (top ? top.amount : data.currentPrice) + data.bidIncrement;

  const place = async () => {
    if (!amount || Number(amount) < minRequired) {
      alert(`ต้องบิดอย่างน้อย ${minRequired}`);
      return;
    }
    const r = await fetch(`/api/auctions/${data.id}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const js = await r.json().catch(()=>({}));
    if (!r.ok) return alert(js.error || 'Bid failed');

    const refreshed = await fetch(`/api/auctions/${id}`).then(res => res.json());
    setData(refreshed);
    setAmount('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      {data.product?.imageUrl ? (
        <img src={data.product.imageUrl} alt="" className="rounded-xl w-full object-cover" />
      ) : null}
      {data.description ? <p className="text-gray-600">{data.description}</p> : null}

      <div className="border rounded-2xl p-4 space-y-1">
        <div>
          ราคาปัจจุบัน: <b>฿{data.currentPrice.toLocaleString()}</b>
          {topName ? <span className="ml-2 text-sm text-gray-600">โดย {topName}</span> : null}
        </div>
        <div>เพิ่มขั้นต่ำ/ครั้ง: ฿{data.bidIncrement.toLocaleString()}</div>
        <div>ปิดประมูล: {new Date(data.endAt).toLocaleString()}</div>
        <div>สถานะ: {data.status}</div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          className="border rounded-xl p-3 flex-1"
          placeholder={`อย่างน้อย ${minRequired}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <button onClick={place} className="px-4 py-3 rounded-xl bg-black text-white">
          วางบิด
        </button>
      </div>

      <div className="space-y-2">
        <div className="font-semibold">ประวัติการบิด</div>
        <ul className="space-y-1">
          {data.bids.map((b) => {
            const name = b.bidder?.name || b.bidder?.email || 'ผู้ใช้ไม่ระบุ';
            return (
              <li key={b.id} className="text-sm border rounded-lg p-2 grid grid-cols-3 gap-2 items-center">
                <span className="font-medium">฿{b.amount.toLocaleString()}</span>
                <span className="truncate text-gray-700">{name}</span>
                <span className="text-gray-500 text-right">{new Date(b.createdAt).toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// pages/admin/auctions/index.tsx
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AuctionListItem } from '../../../types/auction';
import { useRouter } from 'next/router';
export { getServerSideProps } from '@/lib/adminGuardPage';

function fmtDate(input: string | Date) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}
type StatusFilter = 'ALL' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELED';

export default function AdminAuctionsList() {
  const router = useRouter();
  const [items, setItems] = useState<AuctionListItem[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => { const t = setTimeout(() => setQDebounced(q.trim()), 300); return () => clearTimeout(t); }, [q]);

  const url = useMemo(() => {
    const s = new URLSearchParams();
    if (qDebounced) s.set('q', qDebounced);
    if (status !== 'ALL') s.set('status', status);
    return `/api/admin/auctions${s.toString() ? `?${s}` : ''}`;
  }, [qDebounced, status]);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    setLoading(true); setErr(null);
    abortRef.current?.abort();
    const ac = new AbortController(); abortRef.current = ac;

    fetch(url, { signal: ac.signal })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) { router.replace('/admin/login'); return []; }
        if (!r.ok) { const js = await r.json().catch(()=>({})); throw new Error(js.error || `Request failed (${r.status})`); }
        return r.json();
      })
      .then((data) => { if (!ac.signal.aborted) setItems(Array.isArray(data) ? data : []); })
      .catch((e:any) => { if (!ac.signal.aborted) setErr(String(e?.message||'Load failed')); })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });

    return () => ac.abort();
  }, [url, router]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin · Auctions</h1>
        <Link href="/admin/auctions/new" className="px-3 py-2 bg-black text-white rounded-lg">New Auction</Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input className="w-full md:flex-1 border rounded-xl p-3" placeholder="Search…"
          value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="border rounded-xl p-3 md:w-56" value={status} onChange={(e)=>setStatus(e.target.value as StatusFilter)}>
          <option value="ALL">All statuses</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="LIVE">LIVE</option>
          <option value="ENDED">ENDED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>

      {loading && <div className="text-sm text-gray-600">Loading auctions…</div>}
      {err && <div className="text-sm text-red-600">Error: {err}</div>}
      {!loading && !err && items.length === 0 && (
        <div className="text-sm text-gray-600 border rounded-xl p-4">No auctions found.</div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3">Title</th>
                <th className="px-3">Current</th>
                <th className="px-3">Ends</th>
                <th className="px-3">Status</th>
                <th className="px-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(a=>(
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{a.title}</td>
                  <td className="px-3">฿{Number(a.currentPrice??0).toLocaleString()}</td>
                  <td className="px-3">{fmtDate(a.endAt as any)}</td>
                  <td className="px-3">{a.status}</td>
                  <td className="px-3">
                    <Link href={`/admin/auctions/${a.id}`} className="text-blue-600 hover:underline">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

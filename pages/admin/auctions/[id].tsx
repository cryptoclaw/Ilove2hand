// pages/admin/auctions/[id].tsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
export { getServerSideProps } from '@/lib/adminGuardPage';

type Bid = { id: string; amount: number; createdAt: string; bidder?: { name?: string; email?: string } };
type Product = { id: string; imageUrl?: string | null; translations?: any[] };
type Auction = {
  id: string;
  title: string;
  description?: string | null;
  bidIncrement: number;
  startAt: string;
  endAt: string;
  status: 'SCHEDULED'|'LIVE'|'ENDED'|'CANCELED';
  currentPrice: number;
  product?: Product | null;
  bids: Bid[];
};

export default function AdminAuctionManage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [data, setData] = useState<Auction | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    bidIncrement: 10,
    startAt: '',
    endAt: '',
    status: 'SCHEDULED' as Auction['status'],
  });

  useEffect(() => {
    if (!id) return;
    setErr(null);
    fetch(`/api/admin/auctions/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const js = await r.json().catch(()=>({}));
          throw new Error(js.error || `Request failed (${r.status})`);
        }
        return r.json();
      })
      .then((a: Auction) => {
        setData(a);
        setForm({
          title: a.title ?? '',
          description: a.description ?? '',
          bidIncrement: a.bidIncrement ?? 10,
          startAt: toLocalInput(a.startAt),
          endAt: toLocalInput(a.endAt),
          status: a.status,
        });
      })
      .catch((e:any)=> setErr(String(e?.message||'Load failed')));
  }, [id]);

  const topBid = useMemo(() => (data?.bids?.[0] ? data.bids[0] : null), [data]);
  const topName = useMemo(
    () => topBid?.bidder?.name || topBid?.bidder?.email || null,
    [topBid]
  );
  const totalBids = data?.bids?.length ?? 0;

  const canClose = data && !['ENDED','CANCELED'].includes(data.status);
  const canCancel = data && !['ENDED','CANCELED'].includes(data.status);

  const save = async () => {
    if (!data) return;
    const startIso = fromLocalInput(form.startAt);
    const endIso = fromLocalInput(form.endAt);
    if (!startIso || !endIso) return alert('Please set start/end time');
    if (new Date(endIso) <= new Date(startIso)) return alert('End time must be after start time');

    setSaving(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        bidIncrement: Number(form.bidIncrement),
        startAt: startIso,
        endAt: endIso,
        status: form.status,
      }),
    });
    const js = await res.json().catch(()=>({}));
    setSaving(false);
    if (!res.ok) return alert(js.error || 'Save failed');
    setData(js);
  };

  const action = async (act: 'close'|'cancel') => {
    if (!data) return;
    if (act === 'close' && !confirm('Close this auction now?')) return;
    if (act === 'cancel' && !confirm('Cancel this auction?')) return;

    setBusy(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: act }),
    });
    const js = await res.json().catch(()=>({}));
    setBusy(false);
    if (!res.ok) return alert(js.error || 'Action failed');
    setData(js);
    setForm((f)=>({ ...f, status: js.status }));
  };

  const del = async () => {
    if (!data) return;
    if (!confirm('Delete this auction? This cannot be undone.')) return;
    setBusy(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return alert('Delete failed');
    router.replace('/admin/auctions');
  };

  const [uploading, setUploading] = useState(false);
  const changeImage = async (file: File) => {
    if (!data?.product?.id) return alert('This auction has no product.');
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    const up = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
    const upJs = await up.json().catch(()=>({}));
    if (!up.ok) { setUploading(false); return alert(upJs.error || 'Upload failed'); }
    const res = await fetch(`/api/admin/products/${data.product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: upJs.url }),
    });
    const js = await res.json().catch(()=>({}));
    setUploading(false);
    if (!res.ok) return alert(js.error || 'Update product failed');
    setData(d => d && d.product
      ? { ...d, product: { ...d.product, imageUrl: upJs.url } }
      : d
    );
  };

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">Manage Auction</h1>
        <a href={`/auctions/${data.id}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline" title="View public page">
          View public
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-semibold mt-1">{data.status}</div>
        </div>
        <div className="border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Current Price</div>
          <div className="font-semibold mt-1">
            ฿{data.currentPrice.toLocaleString()}
            {topName ? <span className="ml-2 text-sm text-gray-600">by {topName}</span> : null}
          </div>
        </div>
        <div className="border rounded-2xl p-4">
          <div className="text-sm text-gray-500">Top Bid / Total Bids</div>
          <div className="font-semibold mt-1">
            {topBid ? `฿${topBid.amount.toLocaleString()}` : '-'} / {totalBids}
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-4 space-y-3">
        <div className="font-semibold">Product</div>
        <div className="flex items-center gap-4">
          {data.product?.imageUrl ? (
            <img src={data.product.imageUrl} className="w-28 h-28 object-cover rounded-xl border" alt="" />
          ) : (
            <div className="w-28 h-28 bg-gray-200 rounded-xl border" />
          )}
          <div className="space-y-2">
            <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) changeImage(f); }} disabled={uploading} />
            {uploading && <div className="text-xs text-gray-500">Uploading…</div>}
            {!data.product?.id && <div className="text-xs text-red-600">This auction has no product attached.</div>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Title</span>
          <input className="w-full border p-2 rounded" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Description</span>
          <textarea className="w-full border p-2 rounded" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">Bid Increment</span>
            <input type="number" className="w-full border p-2 rounded" value={form.bidIncrement} onChange={(e)=>setForm({...form, bidIncrement:Number(e.target.value)})} min={1} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Status</span>
            <select className="w-full border p-2 rounded" value={form.status} onChange={(e)=>setForm({...form, status:e.target.value as Auction['status']})}>
              {['SCHEDULED','LIVE','ENDED','CANCELED'].map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">Start At</span>
            <input type="datetime-local" className="w-full border p-2 rounded" value={form.startAt} onChange={(e)=>setForm({...form, startAt: e.target.value})} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">End At</span>
            <input type="datetime-local" className="w-full border p-2 rounded" value={form.endAt} onChange={(e)=>setForm({...form, endAt: e.target.value})} />
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white rounded">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={()=>action('close')} disabled={!canClose || busy} className={`px-4 py-2 rounded text-white ${canClose ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}>
          Close Now
        </button>
        <button onClick={()=>action('cancel')} disabled={!canCancel || busy} className={`px-4 py-2 rounded text-white ${canCancel ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-300 cursor-not-allowed'}`}>
          Cancel
        </button>
        <button onClick={del} disabled={busy} className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Delete
        </button>
      </div>

      {/* Bid history with bidder names */}
      <div className="space-y-2">
        <div className="font-semibold">Bid History</div>
        <ul className="space-y-1">
          {data.bids.map((b) => {
            const displayName = b.bidder?.name || b.bidder?.email || 'Unknown user';
            return (
              <li key={b.id} className="text-sm border rounded-lg p-2 grid grid-cols-3 gap-2 items-center">
                <span className="font-medium">฿{b.amount.toLocaleString()}</span>
                <span className="truncate text-gray-700">{displayName}</span>
                <span className="text-gray-500 text-right">{new Date(b.createdAt).toLocaleString()}</span>
              </li>
            );
          })}
          {data.bids.length === 0 && (
            <li className="text-sm text-gray-500 border rounded-lg p-2">No bids yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function toLocalInput(dt: string) {
  const d = new Date(dt);
  const pad = (n:number)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(s: string) {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

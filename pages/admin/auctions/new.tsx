import { useEffect, useMemo, useState } from "react";
export { getServerSideProps } from "@/lib/adminGuardPage";

type Product = {
  id: string;
  imageUrl?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

export default function NewAuctionPage() {
  /* --------------------- เลือกสินค้าที่มีอยู่ --------------------- */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      const q = query.trim();
      if (!q) { setResults([]); return; }
      const r = await fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}`);
      const js = await r.json();
      if (!cancel) setResults(js);
    };
    const t = setTimeout(run, 300);
    return () => { cancel = true; clearTimeout(t); };
  }, [query]);

  /* --------------------- ฟอร์ม Auction --------------------- */
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startPrice, setStartPrice] = useState<number | "">(500);
  const [bidIncrement, setBidIncrement] = useState<number | "">(50);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(false);

  const nowIsoLocal = () => new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16); // +5 นาที
  const endIsoLocal = () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // +2 วัน
  useEffect(() => { setStartAt(nowIsoLocal()); setEndAt(endIsoLocal()); }, []);

  const numericOk = useMemo(
    () =>
      typeof startPrice === "number" && startPrice > 0 &&
      typeof bidIncrement === "number" && bidIncrement > 0,
    [startPrice, bidIncrement]
  );

  const submit = async () => {
    if (!selectedId) return alert("กรุณาเลือกสินค้า");
    if (!title.trim()) return alert("กรุณาระบุชื่อประมูล");
    if (!numericOk) return alert("ราคาเริ่มต้นและเพิ่มขั้นต่ำต้องมากกว่า 0");
    if (!startAt || !endAt) return alert("กรุณากำหนดเวลาเริ่ม/สิ้นสุดการประมูล");
    if (new Date(endAt) <= new Date(startAt)) return alert("เวลาปิดต้องหลังเวลาเริ่ม");

    setLoading(true);
    const body = {
      productId: selectedId,
      title: title.trim(),
      description: desc.trim() || undefined,
      startPrice: Number(startPrice),
      bidIncrement: Number(bidIncrement),
      startAt,
      endAt,
    };

    const res = await fetch("/api/admin/auctions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const js = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return alert(js.error || "Create failed");
    location.href = `/admin/auctions/${js.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">New Auction</h1>

      {/* --------- เลือกสินค้าที่มีอยู่ --------- */}
      <div className="space-y-2 border rounded-xl p-4">
        <label className="block">
          <span className="text-sm text-gray-600">ค้นหาสินค้า</span>
          <input
            className="w-full border p-2 rounded"
            placeholder="พิมพ์ชื่อสินค้า…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="max-h-56 overflow-auto border rounded">
          {results.map((p) => {
            const name =
              p.translations.find((t) => t.locale === "en")?.name ||
              p.translations[0]?.name ||
              "Unnamed";
            return (
              <label key={p.id} className="flex items-center gap-2 p-2 border-b">
                <input
                  type="radio"
                  name="pick"
                  checked={selectedId === p.id}
                  onChange={() => setSelectedId(p.id)}
                />
                {p.imageUrl ? (
                  <img src={p.imageUrl} className="h-10 w-10 object-cover rounded" alt="" />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded" />
                )}
                <span>{name}</span>
              </label>
            );
          })}
          {results.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
        </div>
        {selectedId && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            เลือกสินค้าแล้ว (ID: {selectedId})
          </div>
        )}
      </div>

      {/* --------------------- ส่วน Auction --------------------- */}
      <label className="block">
        <span className="text-sm text-gray-600">ชื่อรายการประมูล</span>
        <input
          className="w-full border p-2 rounded"
          placeholder="เช่น ประมูล iPhone 13 สีดำ 128GB"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">รายละเอียดประมูล</span>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="ระบุเงื่อนไข / วิธีชำระเงิน / นัดรับ"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-gray-600">ราคาเริ่มต้น (THB)</span>
          <input
            type="number"
            min={1}
            step={1}
            className="w-full border p-2 rounded"
            placeholder="อย่างน้อย 1"
            value={startPrice}
            onChange={(e) =>
              setStartPrice(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))
            }
          />
          <small className="text-gray-500">ราคาที่ระบบจะเริ่มนับการประมูลครั้งแรก</small>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">เพิ่มขั้นต่ำ/ครั้ง (THB)</span>
          <input
            type="number"
            min={1}
            step={1}
            className="w-full border p-2 rounded"
            placeholder="อย่างน้อย 1"
            value={bidIncrement}
            onChange={(e) =>
              setBidIncrement(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))
            }
          />
          <small className="text-gray-500">แต่ละบิดต้องมากกว่าราคาล่าสุดอย่างน้อยเท่านี้</small>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-gray-600">เริ่มประมูล</span>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">ปิดประมูล</span>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </label>
      </div>

      <button
        onClick={submit}
        disabled={loading || !numericOk || !selectedId}
        className={`px-4 py-2 rounded ${
          loading || !numericOk || !selectedId
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-black text-white"
        }`}
      >
        {loading ? "Creating…" : "Create"}
      </button>
    </div>
  );
}

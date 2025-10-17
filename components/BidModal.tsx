// src/components/BidModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type BidItem = {
  id: string;
  title: string;
  highestBid?: number | null;
  startPrice?: number | null;
  minIncrement?: number | null;
  bidIncrement?: number | null;
  shipping?: { fee?: number | null } | null;
};

type BidModalProps = {
  open: boolean;
  onClose: () => void;
  item: BidItem;
  onConfirm: (amount: number) => void | Promise<void>; // 👈 กำหนดเป็น number ชัดเจน
};

const toNum = (x: unknown, fallback = 0) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : fallback;
};

const formatTHB = (n?: number | null) =>
  toNum(n).toLocaleString("th-TH", { maximumFractionDigits: 0 });

export default function BidModal({
  open,
  onClose,
  item,
  onConfirm,
}: BidModalProps) {
  const step = useMemo(
    () => toNum(item.minIncrement ?? item.bidIncrement, 0),
    [item.minIncrement, item.bidIncrement]
  );
  const highest = useMemo(() => toNum(item.highestBid, 0), [item.highestBid]);
  const startPrice = useMemo(
    () => toNum(item.startPrice, 0),
    [item.startPrice]
  );
  const shipFee = useMemo(
    () => toNum(item.shipping?.fee, 0),
    [item.shipping?.fee]
  );

  // ต้องบิดอย่างน้อย = max( startPrice, highest + step(ถ้ามี) )
  const minBid = useMemo(
    () => Math.max(startPrice, highest + (step || 0)),
    [startPrice, highest, step]
  );

  const [amount, setAmount] = useState<number>(minBid);
  const inputRef = useRef<HTMLInputElement>(null);

  // เปิด modal: focus ช่องกรอก และ reset เป็น min
  useEffect(() => {
    if (!open) return;
    setAmount(minBid);
    // เล็กน้อยเพื่อให้ input render ก่อน
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, minBid]);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const notEnough = amount < minBid;
  const notOnStep = step > 0 ? (amount - highest) % step !== 0 : false;
  const canConfirm = !notEnough && !notOnStep;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm(amount);
  };

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-3"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <h2 className="ml-1 text-lg font-semibold text-black">
            การประมูลสินค้า
          </h2>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="rounded px-2 py-1 text-black/70 hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* ชื่อสินค้า */}
          <div>
            <div className="text-sm text-black/60">ชื่อสินค้า</div>
            <div className="font-semibold leading-snug text-black">
              {item.title}
            </div>
          </div>

          {/* ราคาสูงสุดตอนนี้ + ช่องกรอก */}
          <div className="grid grid-cols-2 gap-4 items-start">
            {/* ซ้าย */}
            <div>
              <div className="text-sm text-black/60">ราคาสูงสุดตอนนี้</div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {formatTHB(highest)} บาท
              </div>
              {step > 0 && (
                <div className="mt-1 text-xs text-black/60">
                  เพิ่มทีละอย่างน้อย: <b>{formatTHB(step)} THB</b>
                </div>
              )}
            </div>

            {/* ขวา */}
            <div>
              <label className="text-sm text-black/60">จำนวนเงินประมูล</label>
              <div className="mt-1 grid grid-cols-[1fr_auto] items-center gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  step={step || 1}
                  min={minBid}
                  value={Number.isFinite(amount) ? amount : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = Number(e.target.value);
                    setAmount(Number.isFinite(v) ? Math.floor(v) : minBid);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirm();
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-right font-semibold text-black focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <span className="text-sm text-black/80">บาท</span>
              </div>

              {notEnough && (
                <div className="mt-1 text-xs text-red-600">
                  ใส่ราคาอย่างน้อย {formatTHB(minBid)} บาท
                </div>
              )}
              {notOnStep && (
                <div className="mt-1 text-xs text-red-600">
                  ราคาต้องเพิ่มทีละ {formatTHB(step)} บาทจากราคาสูงสุดตอนนี้
                </div>
              )}
            </div>
          </div>

          {/* เส้นคั่น */}
          <hr className="my-1 border-black/10" />

          {/* สรุปยอด */}
          <div>
            <div className="text-center text-sm font-semibold mb-2 text-black">
              สรุปยอดที่ต้องชำระ
            </div>
            <div className="grid grid-cols-2 text-sm gap-y-1">
              <div className="text-black/70">ราคาสินค้า</div>
              <div className="text-right text-black">
                {formatTHB(amount)} บาท
              </div>

              <div className="text-black/70">ค่าจัดส่ง</div>
              <div className="text-right text-black">
                {formatTHB(shipFee)} บาท
              </div>

              <div className="col-span-2 my-1 border-t border-black/10" />

              <div className="font-semibold text-black">รวมยอดทั้งหมด</div>
              <div className="text-right font-bold text-red-600">
                {formatTHB(amount + shipFee)} บาท
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-end gap-3 bg-black/5">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 font-semibold bg-white border border-black/10 text-black hover:bg-black/5"
          >
            ยกเลิก
          </button>
          <button
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={[
              "rounded-lg px-4 py-2 font-semibold text-white",
              canConfirm
                ? "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                : "bg-red-300 cursor-not-allowed",
            ].join(" ")}
          >
            ยืนยันการประมูล
          </button>
        </div>
      </div>
    </div>
  );
}

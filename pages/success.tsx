// pages/orders/success.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const orderNo = useMemo(() => {
    const o = router.query.order;
    return Array.isArray(o) ? o[0] : o;
  }, [router.query.order]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BG: ขาว -> เทาอ่อน (light), เทาเข้ม -> ดำ (dark) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      {/* Red soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl bg-red-300/30 dark:bg-red-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl bg-rose-300/30 dark:bg-rose-600/10" />

      {/* Red confetti */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-10 top-24 h-2 w-2 rounded-full bg-red-500/80" />
        <div className="absolute left-1/3 top-8 h-1.5 w-1.5 rounded-full bg-rose-500/80" />
        <div className="absolute right-12 top-28 h-1.5 w-1.5 rounded-full bg-red-400/80" />
        <div className="absolute right-1/4 bottom-20 h-2 w-2 rounded-full bg-rose-400/80" />
      </div>

      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="mx-auto w-full rounded-2xl border border-zinc-200/80 bg-white/85 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-inner dark:bg-red-900/40 dark:text-red-300">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              ชำระเงินสำเร็จ
            </span>
          </h1>

          <p className="mb-6 text-center text-zinc-600 dark:text-zinc-300">
            ขอบคุณสำหรับคำสั่งซื้อของคุณ! เราจะดำเนินการจัดส่งให้เร็วที่สุด
          </p>

          {/* Order badge */}
          {orderNo && (
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700 dark:border-red-700/40 dark:bg-red-900/30 dark:text-red-200">
                หมายเลขคำสั่งซื้อ:{" "}
                <span className="font-semibold">{orderNo}</span>
              </span>
            </div>
          )}

          {/* Delivery box */}
          <div className="mx-auto mb-8 max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-200">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10 17h4a4 4 0 0 0 4-4V5H6v8a4 4 0 0 0 4 4Z" />
                <path d="M6 9h12" />
              </svg>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  กำลังเตรียมจัดส่ง
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  โดยปกติใช้เวลา 2–4 วันทำการ (ยกเว้นพื้นที่ห่างไกล/ช่วงพีค)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 sm:w-auto dark:focus:ring-red-800"
            >
              ดูคำสั่งซื้อของฉัน
            </Link>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-3 text-zinc-900 transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 sm:w-auto dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              กลับหน้าหลัก
            </Link>
          </div>

          {/* Tip */}
          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            ต้องการใบเสร็จ/ใบกำกับภาษี? ไปที่{" "}
            <Link
              href="/account"
              className="font-medium text-red-700 underline decoration-dotted underline-offset-2 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
            >
              บัญชีของฉัน
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

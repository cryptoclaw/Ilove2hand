// pages/orders.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import useTranslation from "next-translate/useTranslation";
import {
  Clock,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  PackageOpen,
} from "lucide-react";

/* ---------- Types ---------- */
interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;

  // รองรับทั้ง nested/flat (บางแบ็กเอนด์อาจไม่มี product)
  product?: {
    name?: string;
    title?: string;
    productName?: string;
    imageUrl?: string | null;
    image?: string | null;
  } | null;
  productName?: string;
  name?: string;
  title?: string;
  imageUrl?: string | null;
  image?: string | null;

  // กันเคสที่ฟิลด์ใช้ชื่อแปลก ๆ (เช่น titleTH, pictureUrl) — helper จะสแกนด้วย regex อยู่แล้ว
  [k: string]: unknown;
}

type OrderSummary = {
  id: string;
  totalAmount: number;
  status: string; // PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED
  createdAt: string;
  items: OrderItem[];
};

/* ---------- UI constants ---------- */
const STATUS_TABS = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

const STATUS_META: Record<
  (typeof STATUS_TABS)[number],
  { icon: React.ElementType; chip: string; text: string }
> = {
  pending: {
    icon: Clock,
    chip: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
  },
  processing: {
    icon: Loader2,
    chip: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
  },
  shipped: {
    icon: Truck,
    chip: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
  },
  completed: {
    icon: CheckCircle2,
    chip: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
  },
  cancelled: {
    icon: XCircle,
    chip: "bg-rose-100 text-rose-700",
    text: "text-rose-700",
  },
};

/* ---------- Helpers: หยิบชื่อ/รูปแบบไม่ผูกชื่อคีย์ตายตัว ---------- */
function pickFirstStringByKey(obj: unknown, keyRegex: RegExp): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keyRegex.test(k) && typeof v === "string" && v.trim().length > 0) {
      return v;
    }
  }
  return null;
}

type TFunc = (key: string, params?: Record<string, unknown>) => string;

// function getItemName(it: OrderItem, t: TFunc): string {
//   const p = it.product ?? {};
//   // ลองจาก product ก่อน แล้วค่อยจากตัว item เอง (รองรับ title, productName, label, caption, ฯลฯ)
//   const fromProduct =
//     (p && (p as any).name) ||
//     (p && (p as any).title) ||
//     (p && (p as any).productName) ||
//     pickFirstStringByKey(p, /(name|title|label|caption)/i);

//   const fromItem =
//     it.productName ||
//     it.name ||
//     it.title ||
//     pickFirstStringByKey(it, /(name|title|label|caption)/i);

//   const name = (fromProduct as string) ?? (fromItem as string) ?? null;

//   // if (!name) {
//   //   // ช่วย debug ให้เห็นทรงจริงของ item
//   //   // (เปิด DevTools Console จะเห็นตัวอย่าง item ที่ไม่มีชื่อ)
//   //   // eslint-disable-next-line no-console
//   //   console.debug("Unknown item shape (no name-like key):", it);
//   // }
//   // return name ?? (t("unknownProduct") || "ไม่ระบุชื่อสินค้า");
// }

function getItemImage(it: OrderItem): string | null {
  const p = it.product ?? {};
  // รองรับ imageUrl, image, pictureUrl, thumb, thumbnail, img, photo, ... ทั้งจาก product และ item
  const fromProduct =
    (p && (p as any).imageUrl) ||
    (p && (p as any).image) ||
    pickFirstStringByKey(
      p,
      /(image|img|thumb|thumbnail|picture|photo|url)$/i
    ) ||
    pickFirstStringByKey(p, /^(image|img|thumb|thumbnail|picture|photo|url)/i);

  const fromItem =
    it.imageUrl ||
    it.image ||
    pickFirstStringByKey(
      it,
      /(image|img|thumb|thumbnail|picture|photo|url)$/i
    ) ||
    pickFirstStringByKey(it, /^(image|img|thumb|thumbnail|picture|photo|url)/i);

  const img = (fromProduct as string) ?? (fromItem as string) ?? null;

  if (!img) {
    // eslint-disable-next-line no-console
    console.debug("Unknown item shape (no image-like key):", it);
  }
  return img;
}

export default function OrdersPage() {
  const { t, lang } = useTranslation("common");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] =
    useState<(typeof STATUS_TABS)[number]>("pending");

  // formatter วันที่
  const dateFmt = useMemo(
    () => (iso: string) =>
      new Date(iso).toLocaleString(lang === "en" ? "en-US" : "th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [lang]
  );

  // SWR fetcher
  const fetcher = (url: string) =>
    fetch(`${url}?locale=${lang}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(t("ordersLoadError"));
        return res.json();
      })
      .then((data) => data.orders as OrderSummary[]);

  const {
    data: orders,
    error,
    mutate,
    isLoading,
  } = useSWR(user ? "/api/orders" : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60_000,
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // ล็อกทรง payload ตัวอย่างเพื่อไล่คีย์ (ดูได้ใน DevTools)
  useEffect(() => {
    if (orders?.length) {
      // eslint-disable-next-line no-console
      console.log("orders sample ->", orders[0]);
      // eslint-disable-next-line no-console
      console.log("first item ->", orders[0].items?.[0]);
    }
  }, [orders]);

  const ready = !authLoading && !!user;

  // กรองตามสถานะ
  const filteredOrders = useMemo(
    () => (orders ?? []).filter((o) => o.status.toLowerCase() === activeStatus),
    [orders, activeStatus]
  );

  // ยืนยันได้รับสินค้า
  const confirmReceived = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error();
      // optimistic update
      mutate(
        (prev) =>
          (prev ?? []).map((o) =>
            o.id === orderId ? { ...o, status: "COMPLETED" } : o
          ),
        { revalidate: false }
      );
    } catch {
      alert(t("ordersConfirmError"));
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Layout title={t("myOrders")}>
      <div className="mx-auto max-w-7xl px-4 py-6 grid gap-6 md:grid-cols-[280px_1fr]">
        <AccountSidebar />

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t("myOrders")}</h1>
          </div>
          <hr className="mb-6 border-gray-200" />

          {!ready ? (
            <div className="p-6 text-center text-gray-500">
              {t("ordersLoading")}
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-6 flex flex-wrap gap-2">
                {STATUS_TABS.map((st) => {
                  const Icon = STATUS_META[st].icon;
                  const isActive = activeStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setActiveStatus(st)}
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <Icon
                        className={
                          isActive
                            ? "h-4 w-4 text-white"
                            : "h-4 w-4 text-gray-500"
                        }
                      />
                      <span>{t(`status.${st}`)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
                  {t("ordersLoadError")}
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && !orders && (
                <ul className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li
                      key={i}
                      className="animate-pulse bg-white border border-gray-200 rounded-xl p-6"
                    >
                      <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-56 bg-gray-200 rounded mb-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((__, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                            <div className="flex-1">
                              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                              <div className="h-3 w-24 bg-gray-200 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Empty state */}
              {!isLoading && orders && filteredOrders.length === 0 && (
                <div className="p-10 text-center bg-white border border-gray-200 rounded-xl">
                  <PackageOpen className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-700 text-lg font-medium">
                    {t("noOrdersInStatus", {
                      status: t(`status.${activeStatus}`),
                    })}
                  </p>
                  <p className="text-gray-500 mt-1">{t("ordersEmptyHint")}</p>
                </div>
              )}

              {/* รายการคำสั่งซื้อ */}
              {!!filteredOrders.length && (
                <ul className="space-y-6">
                  {filteredOrders.map((o) => {
                    const st =
                      o.status.toLowerCase() as (typeof STATUS_TABS)[number];
                    const meta = STATUS_META[st] ?? STATUS_META.pending;
                    const StIcon = meta.icon;

                    return (
                      <li
                        key={o.id}
                        className="bg-white border border-gray-200 rounded-xl p-6"
                      >
                        {/* ใช้ grid แยกซ้าย/ขวา และให้คอลัมน์ขวายืดเต็มความสูงเพื่อจัด top/bottom */}
                        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                          {/* ซ้าย: หัวการ์ด + รายชื่อสินค้า */}
                          <div>
                            {/* หัวการ์ด */}
                            <div className="mb-4">
                              <p className="text-lg sm:text-xl font-semibold">
                                {t("orderNumber", { id: o.id.slice(-6) })}
                              </p>
                              <p className="text-sm text-gray-500">
                                {dateFmt(o.createdAt)}
                              </p>
                            </div>

                            {/* รายชื่อสินค้า */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {o.items.map((it) => {
                                // const pname = getItemName(it, t as TFunc);
                                const pimg = getItemImage(it);

                                return (
                                  <div
                                    key={it.id}
                                    className="relative flex items-center gap-3"
                                  >
                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                      {pimg ? (
                                        <img
                                          src={pimg}
                                          // alt={pname}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                          {t("noImage")}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm sm:text-base font-medium truncate">
                                        {/* {pname} */}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        {it.quantity} ×{" "}
                                        {t("currency", {
                                          amount: it.priceAtPurchase,
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ขวา: สถานะ (มุมบนขวา) + ราคารวม (มุมล่างขวา) + ปุ่ม */}
                          <aside className="sm:flex sm:flex-col sm:justify-between sm:items-end">
                            {/* มุมบนขวา: สถานะ */}
                            <div
                              className={[
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                meta.chip,
                              ].join(" ")}
                              title={t(`status.${st}`)}
                            >
                              <StIcon className="h-4 w-4" />
                              {t(`status.${st}`)}
                            </div>

                            {/* มุมล่างขวา: ราคารวม */}
                            <div className="mt-4 sm:mt-0 text-right">
                              <div className="text-xl font-semibold">
                                {t("currency", { amount: o.totalAmount })}
                              </div>
                            </div>

                            {/* ปุ่มยืนยันรับของ (ถ้ามี) */}
                            {st === "shipped" && (
                              <button
                                onClick={() => confirmReceived(o.id)}
                                disabled={updatingId === o.id}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900 disabled:opacity-60"
                              >
                                {updatingId === o.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("confirming")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("confirmReceived")}
                                  </>
                                )}
                              </button>
                            )}
                          </aside>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}

// pages/cart.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useTranslation from "next-translate/useTranslation";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name?: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
    stock: number;
  };
}

const fmtTHB = (n: number) => n.toLocaleString("th-TH");

export default function CartPage() {
  const { t, lang } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // UI-only
  const [promo] = useState("");
  const discountRate = 0;
  const deliveryFee = items.length > 0 ? 0 : 0;

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?locale=${lang}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (quantity > item.product.stock) {
      alert(t("cart.exceedStock", { stock: item.product.stock }));
      return;
    }

    const res = await fetch("/api/cart", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    } else {
      const err = await res.json().catch(() => ({}));
      alert(t("cart.error") + ": " + (err.error || "Unknown"));
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    loadCart();
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, lang]);

  const subtotal = items.reduce((sum, it) => {
    const unit = it.product.salePrice ?? it.product.price;
    return sum + unit * it.quantity;
  }, 0);
  const discount = Math.round(subtotal * discountRate);
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // ยังไม่ล็อกอิน
  if (!user) {
    return (
      <Layout title={t("cart.title")}>
        <div className="py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4">
            {t("cart.loginPrompt")}{" "}
            <Link
              href="/login"
              className="font-semibold text-red-600 hover:underline"
            >
              {t("cart.login")}
            </Link>
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("cart.title")}>
      <h1 className="mt-10 mb-5 text-2xl font-bold">{t("cart.title")}</h1>

      {loading ? (
        <p>{t("cart.loading")}</p>
      ) : items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-black/10 bg-white p-12 text-center">
          <ShoppingCart className="mb-3 h-12 w-12 text-gray-400" />
          <p className="mb-5 text-gray-600">{t("cart.empty")}</p>
          <Link
            href="/all-products"
            className="inline-flex items-center rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            {t("cart.browse")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* ซ้าย: รายการสินค้า */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => {
              const unit = item.product.salePrice ?? item.product.price;
              const displayName =
                [
                  item.product?.name,
                  (item as any)?.product?.translationName,
                  (item as any)?.product?.translations?.[0]?.name,
                ].find((v) => typeof v === "string" && v.trim().length > 0) ??
                "สินค้า";

              const left = item.product.stock - item.quantity;
              const low = left <= 5;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.product.imageUrl ?? "/images/placeholder.png"}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="line-clamp-1 text-base font-semibold hover:underline"
                          title={displayName}
                        >
                          {displayName}
                        </Link>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 rounded-full p-1.5 text-red-600 hover:bg-red-50"
                        aria-label="ลบสินค้าออก"
                        title="ลบสินค้าออก"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-lg font-bold">฿{fmtTHB(unit)}</div>

                      <div className="inline-flex items-center rounded-full border border-black/10 bg-white overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="grid h-8 w-8 place-items-center hover:bg-gray-50 focus:outline-none active:bg-gray-100 transition-colors"
                          aria-label="ลดจำนวน"
                          title="ลดจำนวน"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="w-10 select-none text-center text-sm">
                          {item.quantity}
                        </div>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="grid h-8 w-8 place-items-center hover:bg-gray-50 focus:outline-none active:bg-gray-100 transition-colors"
                          aria-label="เพิ่มจำนวน"
                          title="เพิ่มจำนวน"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 flex justify-end text-[12px] text-gray-600">
                      <span className="inline-flex items-baseline gap-1">
                        <span>คงเหลือในคลัง</span>
                        <span
                          className={
                            low ? "text-red-600 font-semibold" : "text-gray-800"
                          }
                        >
                          {Math.max(0, left)}
                        </span>
                        <span>ชิ้น</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ขวา: สรุปคำสั่งซื้อ */}
          <aside className="h-max rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:sticky md:top-24">
            <h2 className="mb-3 text-lg font-bold">สรุปคำสั่งซื้อ</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ยอดรวมสินค้า</span>
                <span className="font-semibold">฿{fmtTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ส่วนลด{" "}
                  {discountRate ? `(${Math.round(discountRate * 100)}%)` : ""}
                </span>
                <span
                  className={
                    discount ? "font-semibold text-red-600" : "font-semibold"
                  }
                >
                  {discount ? `-฿${fmtTHB(discount)}` : "฿0"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">ค่าจัดส่ง</span>
                <span className="font-semibold">฿{fmtTHB(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold">ยอดชำระรวม</span>
                <span className="font-extrabold">฿{fmtTHB(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
              aria-label="ไปชำระเงิน"
              title="ไปชำระเงิน"
            >
              <CreditCard className="h-4 w-4" />
              ไปชำระเงิน
            </button>
          </aside>
        </div>
      )}
    </Layout>
  );
}

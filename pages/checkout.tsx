// pages/checkout.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProvinceSelect from "@/components/ProvinceSelect";
import useTranslation from "next-translate/useTranslation";
import { Minus, Plus, Tag, Upload } from "lucide-react";

/* ---------- Types ---------- */
interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
    stock: number;
  };
}

type OrderItemPayload = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

type AddressPayload = {
  recipient: string;
  line1: string;
  line2: string;
  line3: string;
  city: string;
  postalCode: string;
  country: string;
};

const fmtTHB = (n: number) => n.toLocaleString("th-TH");

/* ---------- helpers ---------- */
function useCountdown(deadline?: string) {
  const target = useMemo(
    () => (deadline ? new Date(deadline).getTime() : null),
    [deadline]
  );
  const [, force] = useState(0);
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => force((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  return { raw: diff, hh, mm, ss };
}

/* ---------- Page ---------- */
export default function CheckoutPage() {
  const refNo = useMemo(() => `#${Date.now()}`, []); // คำนวณครั้งเดียวตอน mount
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // address: default ประเทศไทย
  const [address, setAddress] = useState<AddressPayload>({
    recipient: "",
    line1: "",
    line2: "",
    line3: "",
    city: "",
    postalCode: "",
    country: "ประเทศไทย",
  });

  // coupon
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // QR/Slip section states
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);
  type UIStatus = "PENDING" | "AWAITING_REVIEW" | "FAILED" | "PAID";
  const [status, setStatus] = useState<UIStatus>("PENDING");

  // simple 24h deadline countdown (แก้ให้มาจาก API ได้ในอนาคต)
  const deadline = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString();
  }, []);
  const cd = useCountdown(deadline);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    fetch("/api/cart", { headers: { Authorization: `Bearer ${user}` } })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (newQty < 1) return alert(t("checkout.qtyMin"));
    if (newQty > item.product.stock)
      return alert(t("checkout.qtyMax", { stock: item.product.stock }));

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );

    await fetch(`/api/cart`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user}`,
      },
      body: JSON.stringify({ itemId, quantity: newQty }),
    });
  };

  const subtotal = items.reduce((s, i) => {
    const unit = i.product.salePrice ?? i.product.price;
    return s + unit * i.quantity;
  }, 0);

  // ค่าส่งแบบ Flat (ตามภาพตัวอย่าง 30 บาท)
  const shippingFee = items.length > 0 ? 30 : 0;

  // ยอดรวมสุทธิ
  const grand = Math.max(subtotal + shippingFee - discountAmount, 0);

  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError(t("checkout.couponEmpty"));
      return;
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user}`,
      },
      body: JSON.stringify({ code: couponCode.trim() }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setDiscountAmount(0);
      setCouponError(error);
    } else {
      const { discountValue } = await res.json();
      setDiscountAmount(discountValue);
    }
  };

  const createFormOrder = async () => {
    const orderItems: OrderItemPayload[] = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      priceAtPurchase: i.product.salePrice ?? i.product.price,
    }));
    const fd = new FormData();
    fd.append("items", JSON.stringify(orderItems));
    Object.entries(address).forEach(([k, v]) => fd.append(k, v));
    fd.append("paymentMethod", "bank_transfer");
    if (couponCode.trim()) fd.append("couponCode", couponCode.trim());
    if (slipFile) fd.append("slipFile", slipFile, slipFile.name);
    return fetch("/api/admin/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${user}` },
      body: fd,
    });
  };

  async function onConfirm() {
    if (!slipFile) return setPayMsg("กรุณาแนบสลิปการโอนเงิน");
    if (!agree) return setPayMsg("กรุณายอมรับเงื่อนไขก่อนชำระเงิน");

    setStatus("AWAITING_REVIEW");
    setPayMsg("กำลังยืนยันการชำระเงิน…");

    const res = await createFormOrder();
    if (res.ok) {
      setStatus("PAID");
      setPayMsg(null);
      router.push("/success");
    } else {
      const e = await res.json().catch(() => ({ error: "เกิดข้อผิดพลาด" }));
      setStatus("FAILED");
      setPayMsg(`การชำระเงินไม่สำเร็จ: ${e.error}`);
    }
  }

  if (loading) return <p>{t("checkout.loading")}</p>;

  return (
    <Layout title={t("checkout.title")}>
      {/* <div className="mb-4 text-[13px] text-gray-500">
        <span>Home</span>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900">{t("checkout.heading")}</span>
      </div> */}
      <h1 className="mt-10 mb-4 text-2xl font-bold ">
        {t("checkout.heading")}
      </h1>

      {/* ที่อยู่จัดส่ง — คอมแพ็กให้เท่าการ์ดอื่น */}
      <section className=" mb-6 rounded-2xl border border-black/10 bg-white p-4">
        <h2 className="mb-2 text-base font-semibold">
          {t("checkout.addressHeading")}
        </h2>

        <div className="grid gap-2 md:grid-cols-2">
          <input
            type="text"
            placeholder={t("checkout.recipient")}
            value={address.recipient}
            onChange={(e) =>
              setAddress({ ...address, recipient: e.target.value })
            }
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <input
            type="text"
            placeholder={t("checkout.line1")}
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <input
            type="text"
            placeholder={t("checkout.line2")}
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <input
            type="text"
            placeholder={t("checkout.line3")}
            value={address.line3}
            onChange={(e) => setAddress({ ...address, line3: e.target.value })}
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* แถวล่าง: จังหวัด / รหัสไปรษณีย์ / ประเทศ */}
          <div className="md:col-span-1">
            {/* ถ้า ProvinceSelect รับ className ได้ ให้ใส่แบบนี้ */}
            <ProvinceSelect
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <input
            type="text"
            placeholder={t("checkout.postalCode")}
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          {/* <input
            type="text"
            placeholder={t("checkout.country")}
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
            className="h-9 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          /> */}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-20">
        {/* LEFT: รายการ + QR/Slip */}
        <div className="md:col-span-8 space-y-6">
          {/* Left: QR + Slip (สไตล์ตามตัวอย่าง) */}
          <section className="self-start rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-base font-semibold">สแกนชำระด้วย QR</div>
            <div className="mt-1 text-sm text-rose-600">
              ชำระก่อนหมดเวลา:{" "}
              {cd ? (
                <span>
                  {cd.hh}:{cd.mm}:{cd.ss}
                </span>
              ) : (
                "—"
              )}
            </div>

            <div className="mt-3 flex flex-col md:flex-row md:items-start">
              {/* QR */}
              <div className="w-[240px] md:w-[270px] shrink-0">
                <div className="mx-auto w-[320px] max-w-full">
                  <img
                    src="/images/QR_code.png" // แทนที่ด้วย URL จากแบ็กเอนด์ถ้ามี
                    alt="Thai QR PromptPay"
                    className="w-full aspect-square rounded-md object-contain"
                  />
                </div>
              </div>

              {/* Right: รายละเอียด + แนบสลิป */}
              <div className="flex-1 md:pl-4">
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                  <div className="text-sm text-black/60">ยอดที่ต้องชำระ:</div>
                  <div className="text-base font-bold">{fmtTHB(grand)} บาท</div>

                  <div className="text-sm text-black/60">Ref:</div>
                  <div className="text-sm">{refNo}</div>

                  <div className="text-sm text-black/60">ชื่อบัญชี:</div>
                  <div className="text-sm font-semibold">
                    บริษัท ตัวอย่าง จำกัด
                  </div>
                </div>

                {/* Upload slip */}
                <div className="mt-4">
                  <div className="text-sm font-semibold">แนบสลิปโอนเงิน</div>
                  <div className="text-xs text-black/60">
                    รองรับ JPG/PNG/PDF ขนาดไม่เกิน 10MB
                  </div>

                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
                    />
                    เลือกไฟล์
                    {slipFile && (
                      <span className="max-w-[220px] truncate text-black/70">
                        · {slipFile.name}
                      </span>
                    )}
                  </label>

                  <label className="mt-3 flex items-start gap-2 text-xs text-black/70">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      ข้าพเจ้ายืนยันว่าได้โอนตามยอดและเวลา
                      โดยแนบสลิปที่อ่านชัดเจน
                    </span>
                  </label>

                  {/* Confirm */}
                  <div className="mt-4 border-t border-black/10 pt-3">
                    <div className="flex justify-center">
                      <button
                        onClick={onConfirm}
                        className="mx-auto inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        ยืนยันการชำระเงิน
                      </button>
                    </div>

                    <div className="mt-2 text-center">
                      {status === "AWAITING_REVIEW" && (
                        <div className="text-xs text-blue-600">
                          เราได้รับคำขอของคุณแล้ว กำลังตรวจสอบสลิป (ปกติ 1–3
                          นาที)
                        </div>
                      )}
                      {status === "FAILED" && (
                        <div className="text-xs text-rose-600">
                          {payMsg ?? "การชำระเงินไม่สำเร็จ"}
                        </div>
                      )}
                      {status === "PAID" && (
                        <div className="text-xs text-emerald-600">
                          ชำระเงินสำเร็จ ขอบคุณค่ะ
                        </div>
                      )}
                      {payMsg && status === "PENDING" && (
                        <div className="text-xs text-orange-400">{payMsg}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* RIGHT: Summary */}
        <aside className="md:col-span-4 md:sticky md:top-24 self-start">
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <h3 className="text-base font-bold">สรุปการชำระเงิน</h3>

            {/* รายการสินค้า */}
            <ul className="mt-2 list-disc text-sm text-black/80 space-y-1">
              {items.map((i) => {
                const unit = i.product.salePrice ?? i.product.price;
                const line = unit * i.quantity;
                return (
                  <li
                    key={i.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="line-clamp-1">
                      {i.product.name}
                      <span className="ml-1 text-gray-500">× {i.quantity}</span>
                    </span>

                    <div className="shrink-0">{fmtTHB(line)} บาท</div>
                  </li>
                );
              })}
            </ul>

            {/* สรุปตัวเลข */}
            <div className="mt-3 space-y-1 text-sm">
              <Row label="ค่าสินค้า" value={`${fmtTHB(subtotal)} บาท`} />
              <Row label="ค่าส่ง" value={`${fmtTHB(shippingFee)} บาท`} />
              {discountAmount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`-฿${fmtTHB(discountAmount)}`}
                  valueClass="text-red-600 font-semibold"
                />
              )}
            </div>

            {/* คูปอง */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                {/* ถ้าใช้ lucide-react อยู่แล้ว */}
                <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="ใส่โค้ดส่วนลด"
                  className="w-full rounded-full border border-black/10 bg-white py-2 pl-9 pr-4 text-sm shadow-sm
                 outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <button
                onClick={applyCoupon}
                className="rounded-full border border-black/10 bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200"
              >
                ใช้โค้ด
              </button>
            </div>

            {couponError && (
              <div className="mt-1 text-xs text-rose-600">{couponError}</div>
            )}

            {/* ยอดรวมสุดท้าย */}
            <div className="mt-3 border-t border-black/10 pt-3 text-sm font-semibold flex items-center justify-between">
              <div>ยอดรวม</div>
              <div>฿{fmtTHB(grand)} บาท</div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

/* ---------- UI bits ---------- */
function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gray-600">{label}</div>
      <div className={valueClass}>{value}</div>
    </div>
  );
}

// pages/checkout.tsx
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProvinceSelect from "@/components/ProvinceSelect";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";

// Types
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
  line3: string; // เพิ่ม field line3
  city: string;
  postalCode: string;
  country: string;
};

export default function CheckoutPage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<AddressPayload>({
    recipient: "",
    line1: "",
    line2: "",
    line3: "",
    city: "",
    postalCode: "",
    country: "",
  });

  // เฉพาะวิธีจ่ายเงินที่ไม่ใช้ Stripe
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cod">(
    "bank_transfer"
  );
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // coupon
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    fetch("/api/cart", {
      credentials: "include", // ใช้คุกกี้ HttpOnly
    })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, router]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (newQty < 1) {
      alert(t("checkout.qtyMin"));
      return;
    }
    if (newQty > item.product.stock) {
      alert(t("checkout.qtyMax", { stock: item.product.stock }));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );

    await fetch("/api/cart", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: newQty }),
    });
  };

  const subtotal = items.reduce((sum, i) => {
    const unit = i.product.salePrice ?? i.product.price;
    return sum + unit * i.quantity;
  }, 0);
  const total = Math.max(subtotal - discountAmount, 0);

  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError(t("checkout.couponEmpty"));
      return;
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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

  const createFormOrder = async (method: "bank_transfer" | "cod") => {
    const orderItems: OrderItemPayload[] = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      priceAtPurchase: i.product.salePrice ?? i.product.price,
    }));
    const fd = new FormData();
    fd.append("items", JSON.stringify(orderItems));
    Object.entries(address).forEach(([k, v]) => fd.append(k, v));
    fd.append("paymentMethod", method);
    if (couponCode.trim()) fd.append("couponCode", couponCode.trim());
    if (method === "bank_transfer" && slipFile) {
      fd.append("slipFile", slipFile, slipFile.name);
    }
    return fetch("/api/admin/orders", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
  };

  if (!user) {
    return (
      <Layout title={t("checkout.title")}>
        <p className="p-6">{t("cart.loginPrompt")}</p>
      </Layout>
    );
  }
  if (loading) return <p>{t("checkout.loading")}</p>;

  return (
    <Layout title={t("checkout.title")}>
      <h1 className="text-3xl font-bold mb-6">{t("checkout.title")}</h1>

      {/* Cart items */}
      <div className="space-y-4 mb-6">
        {items.map((i) => {
          const unit = i.product.salePrice ?? i.product.price;
          return (
            <div key={i.id} className="flex items-center border p-4 rounded">
              <div className="w-16 h-16 relative mr-4">
                <Image
                  src={i.product.imageUrl || "/images/placeholder.png"}
                  alt={i.product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{i.product.name}</p>
                <p className="text-gray-600">
                  {unit} ฿ × {i.quantity}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQuantity(i.id, i.quantity - 1)}
                    className="px-2 py-1 border rounded"
                  >
                    –
                  </button>
                  <span>{i.quantity}</span>
                  <button
                    onClick={() => updateQuantity(i.id, i.quantity + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="font-semibold">{unit * i.quantity} ฿</div>
            </div>
          );
        })}
        <div className="text-right text-xl font-bold">
          {t("checkout.subtotal")}: {subtotal} ฿
        </div>
      </div>

      {/* Coupon */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t("checkout.couponHeading")}
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("checkout.couponPlaceholder")}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={applyCoupon}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {t("checkout.couponApply")}
          </button>
        </div>
        {couponError && <p className="mt-1 text-red-600">{couponError}</p>}
        {discountAmount > 0 && (
          <div className="mt-1">
            <span className="line-through text-gray-500 mr-2">
              {subtotal} ฿
            </span>
            <span className="text-green-700 font-bold">
              {t("checkout.totalAfter", { total })}
            </span>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">
          {t("checkout.addressHeading")}
        </h2>
        <input
          type="text"
          placeholder={t("checkout.recipient")}
          value={address.recipient}
          onChange={(e) =>
            setAddress({ ...address, recipient: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder={t("checkout.line1")}
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder={t("checkout.line2")}
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder={t("checkout.line3")}
          value={address.line3}
          onChange={(e) => setAddress({ ...address, line3: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <ProvinceSelect
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            type="text"
            placeholder={t("checkout.postalCode")}
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
            className="w-32 border p-2 rounded"
          />
        </div>
        <input
          type="text"
          placeholder={t("checkout.country")}
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Payment method (Bank transfer / COD) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          {t("checkout.paymentHeading")}
        </h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="w-full border p-2 rounded"
        >
          <option value="bank_transfer">{t("checkout.payBank")}</option>
          <option value="cod">{t("checkout.payCod")}</option>
        </select>

        {/* Bank transfer */}
        {paymentMethod === "bank_transfer" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {t("checkout.uploadSlip")}
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
              className="border p-2 rounded w-full"
            />
            <div className="flex justify-center mt-4">
              <Image
                src="/images/1.png"
                alt="QR Code"
                width={224}
                height={224}
                className="object-contain"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={async () => {
                  setLoading(true);
                  const res = await createFormOrder("bank_transfer");
                  setLoading(false);
                  if (res.ok) router.push("/success");
                  else {
                    const e = await res.json();
                    alert(t("checkout.orderError", { message: e.error }));
                  }
                }}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded disabled:opacity-50"
              >
                {t("checkout.confirmBank")}
              </button>
            </div>
          </div>
        )}

        {/* Cash on delivery */}
        {paymentMethod === "cod" && (
          <div className="flex justify-end">
            <button
              onClick={async () => {
                setLoading(true);
                const res = await createFormOrder("cod");
                setLoading(false);
                if (res.ok) router.push("/success");
                else {
                  const e = await res.json();
                  alert(t("checkout.orderError", { message: e.error }));
                }
              }}
              disabled={loading}
              className="px-6 py-3 bg-yellow-500 text-white rounded disabled:opacity-50"
            >
              {t("checkout.confirmCod")}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

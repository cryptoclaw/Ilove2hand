"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProvinceSelect from "@/components/ProvinceSelect";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  };
}

export default function CheckoutPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState({
    recipient: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, router]);

  const subtotal = items.reduce((sum, item) => {
    const unit = item.product.salePrice ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);

  const total = Math.max(subtotal - discountAmount, 0);

  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) {
      setCouponError("กรุณากรอกรหัสคูปอง");
      return;
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

  const placeOrder = async () => {
    if (
      !address.recipient.trim() ||
      !address.line1.trim() ||
      !address.city.trim()
    ) {
      alert("กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("recipient", address.recipient);
      formData.append("line1", address.line1);
      formData.append("line2", address.line2);
      formData.append("city", address.city);
      formData.append("postalCode", address.postalCode);
      formData.append("country", address.country);
      formData.append("paymentMethod", paymentMethod);
      formData.append("couponCode", couponCode.trim());

      if (paymentMethod === "bank_transfer" && slipFile) {
        formData.append("slip", slipFile);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        // ไปหน้า success เมื่อสั่งซื้อสำเร็จ
        router.push("/success");
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Checkout">
        <p>กำลังโหลด...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* รายการสินค้า */}
      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const unit = item.product.salePrice ?? item.product.price;
          return (
            <div key={item.id} className="flex items-center border p-4 rounded">
              <img
                src={item.product.imageUrl || "/images/placeholder.png"}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-gray-600">
                  {unit} ฿ × {item.quantity}
                </p>
              </div>
              <div className="font-semibold">{unit * item.quantity} ฿</div>
            </div>
          );
        })}
        <div className="text-right text-xl font-bold">
          ยอดรวมย่อย: {subtotal} ฿
        </div>
      </div>

      {/* คูปองส่วนลด */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">คูปองส่วนลด</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="กรอกรหัสคูปอง"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={applyCoupon}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            ใช้โค้ด
          </button>
        </div>
        {couponError && <p className="mt-1 text-red-600">{couponError}</p>}
        {discountAmount > 0 && (
          <p className="mt-1 text-green-700">รับส่วนลด {discountAmount} ฿</p>
        )}
      </div>

      {/* ฟอร์มที่อยู่จัดส่ง */}
      <div className="mb-6 space-y-4">
        <h2 className="text-xl font-semibold">ที่อยู่จัดส่ง</h2>
        <input
          type="text"
          placeholder="ชื่อผู้รับ"
          value={address.recipient}
          onChange={(e) =>
            setAddress({ ...address, recipient: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="บ้านเลขที่ / ถนน"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ตำบล / อำเภอ"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <ProvinceSelect
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="รหัสไปรษณีย์"
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
            className="w-32 border p-2 rounded"
          />
        </div>
        <input
          type="text"
          placeholder="ประเทศ"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* วิธีชำระเงิน */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">วิธีการชำระเงิน</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="bank_transfer">โอนผ่านธนาคาร</option>
          <option value="credit_card">บัตรเครดิต</option>
          <option value="cod">เก็บเงินปลายทาง</option>
        </select>
      </div>

      {/* แสดง QR Code และช่องอัปโหลดสลิปเมื่อเลือกโอนผ่านธนาคาร */}
      {paymentMethod === "bank_transfer" && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">อัปโหลดสลิปการโอน</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full mb-4"
          />
          <div className="flex justify-center">
            <img
              src="/images/1.png"
              alt="QR Code ธนาคาร"
              className="w-56 h-56 object-contain"
            />
          </div>
        </div>
      )}

      {/* ยอดรวมทั้งหมด */}
      <div className="flex justify-between items-center p-4 border-t mb-6">
        <span className="text-xl font-bold">ยอดรวมทั้งสิ้น:</span>
        <span className="text-2xl font-bold text-green-700">{total} ฿</span>
      </div>

      {/* ปุ่มยืนยันคำสั่งซื้อ */}
      <div className="text-right">
        <button
          onClick={placeOrder}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </div>
    </Layout>
  );
}

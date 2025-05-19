// pages/cart.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลตะกร้า
  const loadCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ลบรายการจากตะกร้า
  const removeItem = async (itemId: string) => {
    if (!token) return;
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      // โหลดข้อมูลใหม่
      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const total = items.reduce((sum, item) => {
    const unit = item.product.salePrice ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);

  if (!token) {
    return (
      <Layout title="ตะกร้าสินค้า">
        <p className="text-center py-8">
          กรุณา{" "}
          <Link href="/login" className="text-blue-600">
            Login
          </Link>{" "}
          ก่อนดูตะกร้า
        </p>
      </Layout>
    );
  }

  return (
    <Layout title="ตะกร้าสินค้า">
      <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : items.length === 0 ? (
        <p>
          ตะกร้าว่างเปล่า{" "}
          <Link href="/all-products" className="text-blue-600">
            ดูสินค้า
          </Link>
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const unit = item.product.salePrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="flex items-center border p-4 rounded"
                >
                  <img
                    src={item.product.imageUrl || "/images/placeholder.png"}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-600">ราคาต่อหน่วย: {unit} ฿</p>
                    <p className="text-gray-600">จำนวน: {item.quantity}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold">
                      รวม: {unit * item.quantity} ฿
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    ลบ
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-xl font-bold">ยอดรวมทั้งหมด:</span>
            <span className="text-2xl font-bold text-green-700">{total} ฿</span>
          </div>

          <div className="text-right mt-6">
            <button
              onClick={() => router.push("/checkout")}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}

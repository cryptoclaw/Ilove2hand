// pages/cart.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลตะกร้าจาก API
  useEffect(() => {
    if (!token) return setLoading(false);
    fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // คำนวณยอดรวม
  const total = items.reduce((sum, item) => {
    const unit = item.product.salePrice ?? item.product.price;
    return sum + unit * item.quantity;
  }, 0);

  // ถ้ายังไม่ล็อกอิน
  if (!token) {
    return (
      <Layout title="ตะกร้าสินค้า">
        <div className="py-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="mb-4">
            กรุณา&nbsp;
            <Link href="/login" className="text-green-600 hover:underline">
              Login
            </Link>
            &nbsp;ก่อนดูตะกร้า
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ตะกร้าสินค้า">
      <h1 className="text-3xl font-bold mb-6">ตะกร้าสินค้า</h1>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="mb-4">ตะกร้าว่างเปล่า</p>
          <Link
            href="/all-products"
            className="inline-block btn bg-green-600 hover:bg-green-700 text-white"
          >
            ดูสินค้าเพิ่มเติม
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {items.map((item) => {
              const unit = item.product.salePrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="card flex items-center p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl ?? "/images/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 px-4">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium text-lg hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">
                      ราคาต่อหน่วย: ฿{unit}
                    </p>
                    <p className="text-gray-700">จำนวน: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      รวม: ฿{unit * item.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-xl font-bold">ยอดรวมทั้งหมด:</span>
            <span className="text-2xl font-bold text-green-600">฿{total}</span>
          </div>

          <div className="text-right mt-6">
            <button className="btn bg-blue-600 hover:bg-blue-700 text-white">
              ดำเนินการชำระเงิน
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}

// pages/orders.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

type OrderItem = {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: {
    name: string;
    imageUrl?: string | null;
  };
};

type OrderSummary = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((data) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, router]);

  if (loading) return <p>Loading your orders…</p>;

  return (
    <Layout title="My Orders">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border p-4 rounded hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/order?id=${o.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Order </span>
                  <div className="text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()}{" "}
                    {new Date(o.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div>
                    Total: <strong>{o.totalAmount} ฿</strong>
                  </div>
                  <div className="text-sm">
                    Status: <em>{o.status}</em>
                  </div>
                </div>
              </div>

              {/* รายการสินค้า */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {o.items.map((it) => (
                  <div key={it.id} className="flex flex-col items-center">
                    {it.product.imageUrl ? (
                      <img
                        src={it.product.imageUrl}
                        alt={it.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    <p className="mt-2 text-sm text-center">
                      {it.product.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {it.quantity} × {it.priceAtPurchase} ฿
                    </p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

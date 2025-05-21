// pages/admin/orders.tsx
import { GetServerSideProps, NextPage } from "next";
import Layout from "@/components/Layout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { useState } from "react";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  recipient: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  slipUrl?: string | null;
}

interface Props {
  orders: Order[];
}

const AdminOrdersPage: NextPage<Props> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // ฟังก์ชันเปลี่ยนสถานะออเดอร์
  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  return (
    <Layout title="จัดการคำสั่งซื้อ (Admin)">
      <h1 className="text-3xl font-bold mb-6">จัดการคำสั่งซื้อ</h1>
      <Link href="/" className="text-blue-600 mb-4 block">
        &larr; กลับหน้าหลัก
      </Link>

      {orders.length === 0 ? (
        <p>ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded">
              <div className="flex justify-between mb-2">
                <div>
                  <strong>ผู้รับ:</strong> {order.recipient} <br />
                  <strong>ที่อยู่:</strong> {order.line1} {order.line2}{" "}
                  {order.city} {order.postalCode} {order.country}
                </div>
                <div>
                  <strong>สถานะ:</strong>{" "}
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="PENDING">รอดำเนินการ</option>
                    <option value="PROCESSING">กำลังดำเนินการ</option>
                    <option value="SHIPPED">จัดส่งแล้ว</option>
                    <option value="COMPLETED">สำเร็จ</option>
                    <option value="CANCELLED">ยกเลิก</option>
                  </select>
                </div>
              </div>

              <div className="mb-2">
                <strong>รายการสินค้า:</strong>
                <ul className="ml-4 list-disc">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl || "/images/placeholder.png"}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span>
                        {item.product.name} x {item.quantity} -{" "}
                        {item.priceAtPurchase * item.quantity} ฿
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* เพิ่มส่วนนี้แสดงรูปสลิป */}
              {order.slipUrl && (
                <div className="mt-2">
                  <strong>สลิปโอนเงิน:</strong>
                  <img
                    src={order.slipUrl}
                    alt="Slip"
                    className="w-48 h-auto rounded border mt-1"
                  />
                </div>
              )}

              <div className="text-right font-bold">
                ยอดรวม: {order.totalAmount} ฿
              </div>
              <div className="text-sm text-gray-500 mt-2">
                วันที่สั่งซื้อ:{" "}
                {new Date(order.createdAt).toLocaleString("th-TH")}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  adminGuard(ctx, async () => {
    const rawOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // แปลงวันที่ให้เป็น string
    const orders = rawOrders.map((o) => ({
      id: o.id,
      recipient: (o as any).recipient || "", // เพิ่ม recipient ถ้ามีใน schema
      line1: (o as any).line1 || "",
      line2: (o as any).line2 ?? null,
      city: (o as any).city || "",
      postalCode: (o as any).postalCode ?? null,
      country: (o as any).country ?? null,
      paymentMethod: o.paymentMethod,
      status: o.status,
      totalAmount: o.totalAmount,
      slipUrl: o.slipUrl,
      items: o.items.map((i) => ({
        id: i.id,
        product: {
          id: i.product.id,
          name: i.product.name,
          imageUrl: i.product.imageUrl,
        },
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase,
      })),
      createdAt: o.createdAt.toISOString(),
    }));

    return { props: { orders } };
  });

export default AdminOrdersPage;

// pages/admin/orders.tsx
import { GetServerSideProps, NextPage } from "next";
import Layout from "@/components/AdminLayout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { useState } from "react";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  recipient: string;
  line1: string;
  line2?: string | null;
  line3?: string | null;
  city: string;
  postalCode?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  items: OrderItem[];
  slipUrl?: string | null;
  createdAt: string;
}

interface Props {
  orders: Order[];
}

const currency = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    n
  );

const AdminOrdersPage: NextPage<Props> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (busyId) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "include", // สำคัญ: ใช้คุกกี้ HttpOnly
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e: any) {
      alert(e.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (busyId) return;
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อนี้?")) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status !== 204) throw new Error("ลบคำสั่งซื้อไม่สำเร็จ");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e: any) {
      alert(e.message || "ลบคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setBusyId(null);
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
              <div className="flex justify-between mb-2 gap-4">
                <div className="min-w-0">
                  <div className="font-semibold break-all">
                    เลขที่คำสั่งซื้อ: {order.id}
                  </div>
                  <div>
                    <strong>ผู้รับ:</strong> {order.recipient}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>ที่อยู่:</strong>{" "}
                    {[
                      order.line1,
                      order.line2,
                      order.line3,
                      order.city,
                      order.postalCode,
                      order.country,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                  <div className="text-xs text-gray-500">
                    วันที่สั่งซื้อ:{" "}
                    {new Date(order.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  <div className="flex items-center space-x-2">
                    <strong>สถานะ:</strong>
                    <select
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value as Order["status"])
                      }
                      className="border rounded p-1"
                    >
                      <option value="PENDING">รอดำเนินการ</option>
                      <option value="PROCESSING">กำลังดำเนินการ</option>
                      <option value="SHIPPED">จัดส่งแล้ว</option>
                      <option value="COMPLETED">สำเร็จ</option>
                      <option value="CANCELLED">ยกเลิก</option>
                    </select>
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    disabled={busyId === order.id}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <strong>รายการสินค้า:</strong>
                <ul className="ml-4 mt-2 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.product.imageUrl || "/images/placeholder.png"}
                        alt={item.product.name ?? ""}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">
                          {item.product.name ?? "(No title)"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × {currency(item.priceAtPurchase)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {currency(item.priceAtPurchase * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

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
                ยอดรวม: {currency(order.totalAmount)}
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
    // สามารถเลือก locale ตาม ctx.locale ได้
    const locale = (ctx.locale as "th" | "en") || "th";

    const rawOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: {
                  where: { locale },
                  take: 1,
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const orders: Order[] = rawOrders.map((o) => ({
      id: o.id,
      recipient: o.recipient,
      line1: o.line1,
      line2: o.line2,
      line3: o.line3,
      city: o.city,
      postalCode: o.postalCode,
      country: o.country,
      paymentMethod: o.paymentMethod,
      status: o.status as Order["status"],
      totalAmount: o.totalAmount,
      slipUrl: o.slipUrl,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((it) => ({
        id: it.id,
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
        product: {
          id: it.product.id,
          name: it.product.translations[0]?.name ?? null,
          imageUrl: it.product.imageUrl ?? null,
        },
      })),
    }));

    return { props: { orders } };
  });

export default AdminOrdersPage;

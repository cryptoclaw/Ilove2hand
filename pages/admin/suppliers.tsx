"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Supplier {
  id: string;
  companyName: string;
  productName: string;
  stock: number;
  unitPrice: number;
}

export default function AdminSuppliersPage() {
  const { token, adminLogout } = useAuth();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    productName: "",
    stock: 0,
    unitPrice: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data: Supplier[] = await res.json();
        setSuppliers(data);
      } else if (res.status === 401) {
        adminLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createSupplier = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ companyName: "", productName: "", stock: 0, unitPrice: 0 });
        fetchSuppliers();
      } else {
        alert("สร้างไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;
    const input = prompt(
      "แก้ไข (companyName,productName,stock,unitPrice):",
      `${supplier.companyName},${supplier.productName},${supplier.stock},${supplier.unitPrice}`
    );
    if (!input) return;
    const [companyName, productName, stockStr, priceStr] = input.split(",");
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          companyName,
          productName,
          stock: Number(stockStr),
          unitPrice: Number(priceStr),
        }),
      });
      if (res.ok) fetchSuppliers();
      else alert("อัปเดตไม่สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm("ลบ Supplier รายการนี้?")) return;
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.status === 204) fetchSuppliers();
      else alert("ลบไม่สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <Layout title="จัดการ Suppliers">
      <h1 className="text-2xl font-bold mb-4">จัดการ Suppliers</h1>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="ชื่อบริษัท"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ชื่อสินค้า"
          value={form.productName}
          onChange={(e) => setForm({ ...form, productName: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="สต็อก"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
            className="w-1/2 border p-2 rounded"
          />
          <input
            type="number"
            placeholder="ราคาต่อหน่วย"
            value={form.unitPrice}
            onChange={(e) =>
              setForm({ ...form, unitPrice: Number(e.target.value) })
            }
            className="w-1/2 border p-2 rounded"
          />
        </div>
        <button
          onClick={createSupplier}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "กำลังสร้าง..." : "เพิ่ม Supplier"}
        </button>
      </div>

      <ul className="space-y-2">
        {suppliers.map((s) => (
          <li key={s.id} className="flex justify-between border p-2 rounded">
            <div>
              <p className="font-semibold">{s.companyName}</p>
              <p>
                {s.productName} — Stock: {s.stock} @ {s.unitPrice} ฿ each
              </p>
              <p className="text-right font-bold">
                รวม: {s.stock * s.unitPrice} ฿
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateSupplier(s.id)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >
                แก้ไข
              </button>
              <button
                onClick={() => deleteSupplier(s.id)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

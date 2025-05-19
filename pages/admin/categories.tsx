// pages/admin/categories.tsx
import { GetServerSideProps } from "next";
import { useState, FormEvent } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Category {
  id: string;
  name: string;
}

interface Props {
  initial: Category[];
}

export default function AdminCategoriesPage({ initial }: Props) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const addCategory = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setCategories((prev) => [...prev, data]);
      setNewName("");
    } else {
      alert("Error: " + (data.error ?? "ไม่สามารถเพิ่มได้"));
    }
  };

  const removeCategory = async (id: string) => {
    if (!confirm("ลบหมวดหมู่นี้จริงหรือไม่?")) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (res.status === 204) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert("Error: " + (data.error ?? "ไม่สามารถลบได้"));
    }
  };

  return (
    <Layout title="จัดการหมวดหมู่ (Admin)">
      <h1 className="text-3xl font-bold mb-4">จัดการหมวดหมู่</h1>
      <Link href="/" className="text-blue-600 mb-6 block">
        &larr; กลับหน้าหลัก
      </Link>

      <form onSubmit={addCategory} className="flex items-center gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อหมวดหมู่ใหม่"
          className="border p-2 rounded flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "เพิ่ม"}
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span>{cat.name}</span>
            <button
              onClick={() => removeCategory(cat.id)}
              className="text-red-600 hover:text-red-800"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const initial = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return { props: { initial } };
};

"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Layout from "@/components/AdminLayout"; // ใช้ layout ที่คุณมี
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Banner {
  id: string;
  title: string;
  sub: string | null;
  imageUrl: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
}

export default function HomeManagePage() {
  const [tab, setTab] = useState<"product" | "category" | "banner">("banner");
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <Layout title="จัดการหน้าโฮม">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-300 pb-4">
        จัดการหน้าโฮม
      </h1>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex space-x-4">
          {[
            { key: "product", label: "สร้างสินค้า" },
            { key: "category", label: "จัดการหมวดหมู่" },
            { key: "banner", label: "จัดการแบนเนอร์" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`px-5 py-2 rounded-md font-medium ${
                tab === key
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Add button (เหมือนในรูปแบนเนอร์ มีปุ่ม Add) */}
        
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow p-8 max-w-full overflow-x-auto">
        {tab === "product" && (
          <>
            <CreateProductSection />
            <hr className="my-8 border-gray-200" />
            <ManageProductSection />
          </>
        )}
        {tab === "category" && <ManageCategorySection />}
        {tab === "banner" && <ManageBannerSection />}
      </div>

      {/* Footer / User info */}
      
    </Layout>
  );
}

// --- Create Product Section ---
function CreateProductSection() {
  // โค้ดยังคงเหมือนเดิม
  // ใส่ max width และ spacing ให้ดูดีตามดีไซน์
  // ... ใช้โค้ดเดิมของคุณ
  // เพิ่ม div ห่อ form ด้วย className="max-w-xl"
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    categoryId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.items || data))
      .catch(console.error);
  }, []);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) setFile(files[0]);
    else setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", form.price);
    if (form.salePrice) data.append("salePrice", form.salePrice);
    data.append("stock", form.stock);
    if (form.categoryId) data.append("categoryId", form.categoryId);
    if (file) data.append("image", file);

    const res = await fetch("/api/products", { method: "POST", body: data });
    if (!res.ok) {
      alert("Error creating product");
    } else {
      alert("Created!");
      setForm({
        name: "",
        description: "",
        price: "",
        salePrice: "",
        stock: "",
        categoryId: "",
      });
      setFile(null);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">สร้างสินค้าใหม่</h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="ชื่อสินค้า"
          required
          className="w-full border rounded p-3"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="รายละเอียด"
          className="w-full border rounded p-3"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="ราคา"
          required
          className="w-full border rounded p-3"
        />
        <input
          name="salePrice"
          type="number"
          value={form.salePrice}
          onChange={onChange}
          placeholder="ราคาลด (ไม่บังคับ)"
          className="w-full border rounded p-3"
        />
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={onChange}
          placeholder="จำนวนสต็อก"
          required
          className="w-full border rounded p-3"
        />
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="w-full border rounded p-3"
        >
          <option value="">-- เลือกหมวดหมู่ --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="w-full border rounded p-3"
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded px-5 py-3 hover:bg-green-700 transition"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}

// --- Manage Product Section ---
function ManageProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.items || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    if (!confirm("ลบสินค้านี้หรือไม่?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      setProducts((p) => p.filter((x) => x.id !== id));
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "ไม่สามารถลบได้"));
    }
  };

  if (loading) return <p>กำลังโหลดสินค้า...</p>;

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">จัดการสินค้า</h2>
      {products.length === 0 ? (
        <p>ยังไม่มีสินค้า</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <span>{p.name}</span>
              <button
                onClick={() => remove(p.id)}
                className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700"
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Manage Category Section ---
function ManageCategorySection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCats(data.items || data))
      .catch(console.error);
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCats((c) => [...c, cat]);
      setNewName("");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("ลบไหม?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.status === 204) setCats((c) => c.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">จัดการหมวดหมู่</h2>
      <form onSubmit={add} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อหมวดหมู่ใหม่"
          className="border p-3 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded px-6 py-3 hover:bg-green-700"
        >
          เพิ่ม
        </button>
      </form>
      <ul className="space-y-3">
        {cats.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            {c.name}
            <button
              onClick={() => remove(c.id)}
              className="text-red-600 hover:underline"
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Manage Banner Section ---
export function ManageBannerSection() {
  const [items, setItems] = useState<Banner[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<{
    title: string;
    sub: string;
    order: number;
  }>({ title: "", sub: "", order: 0 });

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => setItems(data.items))
      .catch(console.error);
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setFile(files[0]);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("กรุณาเลือกไฟล์รูปก่อน");

    const fd = new FormData();
    if (form.title.trim()) fd.append("title", form.title.trim());
    if (form.sub.trim()) fd.append("sub", form.sub.trim());
    fd.append("order", String(form.order));
    fd.append("image", file);

    const res = await fetch("/api/banners", {
      method: "POST",
      body: fd,
    });
    if (res.ok) {
      const newBanner: Banner = await res.json();
      setItems((prev) => [...prev, newBanner]);
      setForm({ title: "", sub: "", order: 0 });
      setFile(null);
    } else {
      alert("Error creating banner");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("ต้องการลบแบนเนอร์นี้หรือไม่?")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      setItems((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("Error deleting banner");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">จัดการแบนเนอร์</h2>

      <form onSubmit={onSubmit} className="space-y-5 mb-6 max-w-xl">
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Title (ไม่บังคับ)"
          className="w-full border rounded p-3"
        />
        <input
          name="sub"
          value={form.sub}
          onChange={onChange}
          placeholder="Sub (ไม่บังคับ)"
          className="w-full border rounded p-3"
        />
        <input
          name="order"
          type="number"
          value={form.order}
          onChange={onChange}
          placeholder="Order"
          className="w-full border rounded p-3"
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="w-full border rounded p-3"
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded px-6 py-3 hover:bg-green-700 transition"
        >
          สร้าง/อัปโหลดแบนเนอร์
        </button>
      </form>

      <table className="w-full table-auto border-collapse border border-gray-200 bg-white rounded shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-300 px-4 py-3 w-12">#</th>
            <th className="border border-gray-300 px-4 py-3">Name</th>
            <th className="border border-gray-300 px-4 py-3">Banner</th>
            <th className="border border-gray-300 px-4 py-3 w-40">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b, i) => (
            <tr key={b.id} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-4">{(i + 1).toString().padStart(2, "0")}</td>
              <td className="border border-gray-300 px-4 py-4 font-semibold">{b.title || "-"}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={b.imageUrl}
                  alt={b.title || "Banner image"}
                  className="h-16 rounded object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-4 space-x-4 text-center">
                <button className="text-blue-600 hover:underline">แก้ไข</button>
                <button
                  onClick={() => onDelete(b.id)}
                  className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

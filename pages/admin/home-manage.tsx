// pages/admin/home-manage.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Layout from "@/components/AdminLayout";
import { GetServerSideProps } from "next";
import { adminGuard } from "@/lib/adminGuard";
import { useAuth } from "@/context/AuthContext";
// --- Types ---
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
  // ... คุณอาจไม่จำเป็นต้องใช้ field ทั้งหมดของ Product ที่นี่
}

// --- Admin Dashboard ---
export default function HomeManagePage() {
  const [tab, setTab] = useState<"product" | "category" | "banner">("product");
  const { user } = useAuth();
  console.log("AuthContext user:", user);
  return (
    <Layout title="Home Manage">
      {user ? (
        <p>Welcome, {user.name || user.email || "Admin"}!</p>
      ) : (
        <p>Loading user info...</p>
      )}
      <h1 className="text-3xl font-bold mb-6">Home Manage</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        {[
          { key: "product", label: "สร้างสินค้า" },
          { key: "category", label: "จัดการหมวดหมู่" },
          { key: "banner", label: "จัดการแบนเนอร์" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded ${
              tab === key
                ? "bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "product" && (
        <>
          <CreateProductSection />
          <hr className="my-6" />
          <ManageProductSection />
        </>
      )}
      {tab === "category" && <ManageCategorySection />}
      {tab === "banner" && <ManageBannerSection />}
    </Layout>
  );
}
export const getServerSideProps: GetServerSideProps = async (ctx) =>
  adminGuard(ctx, async () => {
    // ถ้ามีข้อมูลฝั่งเซิร์ฟเวอร์จะ fetch มาใส่ใน props ได้ที่นี่
    return { props: {} };
  });

// --- Create Product Section ---
function CreateProductSection() {
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
    <div>
      <h2 className="text-2xl mb-4">สร้างสินค้าใหม่</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="ชื่อสินค้า"
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="รายละเอียด"
          className="w-full border p-2 rounded"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="ราคา"
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="salePrice"
          type="number"
          value={form.salePrice}
          onChange={onChange}
          placeholder="ราคาลด (ไม่บังคับ)"
          className="w-full border p-2 rounded"
        />
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={onChange}
          placeholder="จำนวนสต็อก"
          required
          className="w-full border p-2 rounded"
        />
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="w-full border p-2 rounded"
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
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}
// ในไฟล์ pages/admin/dashboard.tsx (ต่อจาก CreateProductSection)

function ManageProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดสินค้าทั้งหมด
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.items || data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ลบสินค้า
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
    <div>
      <h2 className="text-2xl mb-4">จัดการสินค้า</h2>
      {products.length === 0 ? (
        <p>ยังไม่มีสินค้า</p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <span>{p.name}</span>
              <button
                onClick={() => remove(p.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
    <div>
      <h2 className="text-2xl mb-4">จัดการหมวดหมู่</h2>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อหมวดหมู่ใหม่"
          className="border p-2 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          เพิ่ม
        </button>
      </form>
      <ul className="space-y-2">
        {cats.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            {c.name}
            <button onClick={() => remove(c.id)} className="text-red-600">
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Manage Banner Section: title/sub optional ---

export function ManageBannerSection() {
  const [items, setItems] = useState<Banner[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<{
    title: string;
    sub: string;
    order: number;
  }>({ title: "", sub: "", order: 0 });

  // โหลดรายการจาก API
  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => setItems(data.items))
      .catch(console.error);
  }, []);

  // handler เปลี่ยนค่า form
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setFile(files[0]);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // สร้าง banner ใหม่
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("กรุณาเลือกไฟล์รูปก่อน");

    const fd = new FormData();
    // append title/sub ถ้ามี
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

  // ลบ banner
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
      <h2 className="text-2xl mb-4">จัดการแบนเนอร์</h2>

      <form onSubmit={onSubmit} className="space-y-4 mb-6 max-w-md">
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Title (ไม่บังคับ)"
          className="w-full border p-2 rounded"
        />
        <input
          name="sub"
          value={form.sub}
          onChange={onChange}
          placeholder="Sub (ไม่บังคับ)"
          className="w-full border p-2 rounded"
        />
        <input
          name="order"
          type="number"
          value={form.order}
          onChange={onChange}
          placeholder="Order"
          className="w-full border p-2 rounded"
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          สร้าง/อัปโหลดแบนเนอร์
        </button>
      </form>

      <ul className="space-y-4">
        {items.map((b) => (
          <li key={b.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={b.imageUrl}
                alt={b.title ?? "Banner image"}
                className="w-32 h-16 object-cover rounded"
              />
              <div className="ml-4">
                <p>Title: {b.title || "-"}</p>
                <p>Sub: {b.sub || "-"}</p>
                <p>Order: {b.order}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(b.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

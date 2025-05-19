// pages/create-product.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import type { Category } from "@/types/product";

export default function CreateProductPage() {
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
  const router = useRouter();

  // ดึงหมวดหมู่จาก API จริง
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(console.error);
  }, []);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setFile(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // validation
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }
    const priceNum = parseFloat(form.price);
    const stockNum = parseInt(form.stock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      alert("กรุณากรอก “ราคา” และ “จำนวนสต็อก” ให้ถูกต้อง");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", priceNum.toString());
    if (form.salePrice.trim()) {
      const sp = parseFloat(form.salePrice);
      if (!isNaN(sp)) {
        data.append("salePrice", sp.toString());
      }
    }
    data.append("stock", stockNum.toString());
    if (form.categoryId) {
      data.append("categoryId", form.categoryId);
    }
    if (file) {
      data.append("image", file);
    }

    const res = await fetch("/api/products", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error || "ไม่สามารถสร้างสินค้าได้"}`);
      return;
    }
    router.push("/all-products");
  };

  return (
    <Layout title="สร้างสินค้าใหม่">
      <h1 className="text-2xl font-bold mb-4">สร้างสินค้าใหม่</h1>
      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
        className="space-y-4 max-w-md"
      >
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
          <option value="">-- เลือกหมวดหมู่ (ไม่บังคับ) --</option>
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
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          บันทึก
        </button>
      </form>
    </Layout>
  );
}

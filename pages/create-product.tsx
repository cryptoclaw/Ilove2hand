// pages/create-product.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface Category {
  id: string;
  name: string;
}

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.items))
      .catch(() => {});
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files) {
      setFile(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    data.append("stock", stockNum.toString());
    if (form.categoryId) data.append("categoryId", form.categoryId);
    if (file) data.append("image", file);

    const res = await fetch("/api/products", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
      return;
    }

    // หลังอัปโหลดสำเร็จ ให้ไปหน้า All Products
    router.push("/all-products");
  };

  return (
    <Layout title="สร้างสินค้าใหม่">
      <h1 className="text-2xl mb-4">สร้างสินค้าใหม่</h1>
      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
        className="space-y-4 max-w-md"
      >
        <input
          name="name"
          onChange={onChange}
          placeholder="ชื่อสินค้า"
          required
          className="border p-2 w-full"
        />
        <input
          name="description"
          onChange={onChange}
          placeholder="รายละเอียด"
          className="border p-2 w-full"
        />
        <input
          name="price"
          type="number"
          onChange={onChange}
          placeholder="ราคา"
          required
          className="border p-2 w-full"
        />
        <input
          name="stock"
          type="number"
          onChange={onChange}
          placeholder="จำนวนสต็อก"
          required
          className="border p-2 w-full"
        />
        <select
          name="categoryId"
          onChange={onChange}
          className="border p-2 w-full"
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
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          บันทึก
        </button>
      </form>
    </Layout>
  );
}

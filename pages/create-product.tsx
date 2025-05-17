// pages/create-product.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      }),
    });
    router.push("/all-products");
  };

  return (
    <Layout>
      <h1 className="text-2xl mb-4">สร้างสินค้าใหม่</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
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
          onChange={onChange}
          placeholder="ราคา"
          type="number"
          required
          className="border p-2 w-full"
        />
        <input
          name="stock"
          onChange={onChange}
          placeholder="จำนวนสต็อก"
          type="number"
          required
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

type ProductCardProps = { product: Product };

const fmtTHB = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 0 });

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth(); // ⬅️ ใช้ user แทน token
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const hasSale =
    product.salePrice != null && product.salePrice < product.price;
  const soldOut = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setAdding(true);
    try {
      // โหลดตะกร้าเพื่อเช็กจำนวน (แนบคุกกี้)
      const cartRes = await fetch("/api/cart", {
        credentials: "include",
      });
      if (!cartRes.ok) throw new Error("Cannot fetch cart");
      const { items: cartItems } = await cartRes.json();
      const currentQuantity =
        (cartItems as { productId: string; quantity: number }[]).find(
          (i) => i.productId === product.id
        )?.quantity ?? 0;

      if (currentQuantity + 1 > product.stock) {
        alert("จำนวนสินค้าเกินสต็อกที่มี");
        setAdding(false);
        return;
      }

      // เพิ่มสินค้าลงตะกร้า (แนบคุกกี้)
      const addRes = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!addRes.ok) {
        const err = await addRes.json().catch(() => ({}));
        if (addRes.status === 409 && err.error === "EXCEEDS_STOCK") {
          alert(`เพิ่มสินค้าไม่สำเร็จ อยู่ในตะกร้าแล้ว ${err.stock} ชิ้น`);
        } else {
          alert("เพิ่มสินค้าไม่สำเร็จ");
        }
        return;
      }
      router.push("/cart");
    } catch {
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className={[
        "group h-full flex flex-col",
        "rounded-lg border border-black/10 bg-white shadow-sm overflow-hidden",
        "hover:shadow-md transition",
        "focus-within:ring-1 focus-within:ring-red-200",
        "relative text-[12px]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 translate-y-[1px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0" />

      <Link href={`/products/${product.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={product.imageUrl ?? "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {soldOut && (
            <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              สินค้าหมด
            </span>
          )}
          {!soldOut && product.isFeatured && (
            <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
              แนะนำ
            </span>
          )}
        </div>

        <div className="p-2.5 flex flex-col gap-y-1 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-black line-clamp-2 min-h-[2.4rem]">
            {product.name}
          </h3>

          {product.description ? (
            <p className="text-[11px] text-gray-600 line-clamp-1 min-h-[1rem]">
              {product.description}
            </p>
          ) : (
            <div className="min-h-[1rem]" />
          )}

          <div className="text-[11px] text-gray-600">
            คงเหลือในคลัง{" "}
            <span className="font-medium text-black">{product.stock}</span> ชิ้น
          </div>

          <div className="mt-1 text-center">
            {hasSale ? (
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-[11px] text-gray-400 line-through">
                  {fmtTHB(product.price)} บาท
                </span>
                <span className="text-xl font-semibold text-red-600">
                  {fmtTHB(product.salePrice!)} บาท
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-black">
                {fmtTHB(product.price)} บาท
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mx-2.5 mb-2 rounded-full border-t border-gray-100" />

      <div className="px-2.5 pb-2.5">
        <div className="flex items-center gap-1.5">
          {soldOut ? (
            <button
              disabled
              className="flex-1 rounded-lg border border-gray-300 bg-gray-100 py-1.5 text-[12px] font-semibold text-gray-500 cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
            >
              สินค้าหมด
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAddToCart();
              }}
              disabled={adding}
              className={[
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-sm font-semibold",
                "bg-red-600 text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)]",
                "hover:bg-red-700 active:bg-red-800",
                "focus:outline-none focus:ring-2 focus:ring-red-200",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{adding ? "กำลังเพิ่ม..." : "เพิ่มในตะกร้า"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

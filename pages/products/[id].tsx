// pages/products/[id].tsx
import { GetServerSideProps } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@/components/Layout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Product as ProductType } from "@/types/product";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Truck, ShoppingCart, Minus, Plus } from "lucide-react";

interface ProductPageProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice: number | null;
    stock: number;
    imageUrl: string | null;
  } | null;
}

export default function ProductPage({ product }: ProductPageProps) {
  const { t } = useTranslation("common");
  const router = useRouter();

  // ✅ ใช้ user จาก useAuth (ไม่ใช้ token)
  const { user } = useAuth();

  if (!product) {
    return (
      <Layout title={t("notFound")}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">{t("productNotFound")}</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← {t("backHome")}
          </Link>
        </div>
      </Layout>
    );
  }

  const [qty, setQty] = useState(product.stock > 0 ? 1 : 0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product.stock === 0) {
      setQty(0);
      setError(t("outOfStock"));
    } else {
      if (qty < 1) setQty(1);
      if (qty > product.stock) {
        setQty(product.stock);
        setError(t("maxQty", { count: product.stock }));
      } else {
        setError("");
      }
    }
  }, [qty, product.stock, t]);

  const addToCart = async () => {
    // ✅ ถ้าไม่ล็อกอิน ให้ไปหน้า login
    if (!user) {
      router.push("/login");
      return;
    }
    if (error || product.stock === 0) return;

    setLoading(true);
    try {
      // ✅ โหลดตะกร้าพร้อมแนบคุกกี้ HttpOnly
      const cartRes = await fetch("/api/cart", {
        credentials: "include",
      });
      if (!cartRes.ok) throw new Error(t("cartFetchError"));

      const { items } = await cartRes.json();
      const inCart = (items as { productId: string; quantity: number }[]).find(
        (i) => i.productId === product.id
      );
      const current = inCart?.quantity ?? 0;

      if (current + qty > product.stock) {
        setError(t("maxInCart", { stock: product.stock, current }));
        setLoading(false);
        return;
      }

      // ✅ เพิ่มสินค้า แนบคุกกี้ ไม่ต้องส่ง Authorization
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (!res.ok) throw new Error(t("addCartError"));

      router.push("/cart");
    } catch (e: any) {
      setError(e?.message || t("addCartError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={product.name}>
      {/* Breadcrumbs */}
      <nav className="mt-10 text-[13px] text-gray-500">
        <Link href="/" className="hover:underline">
          หน้าหลัก
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/all-products" className="hover:underline">
          สินค้าพร้อมส่ง
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-900 ">
          {product.name.length > 18
            ? product.name.slice(0, 18) + "…"
            : product.name}
        </span>
      </nav>

      <div className="mx-auto w/full max-w-5xl px-6 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* ซ้าย: รูป */}
          <div className="relative w-full aspect-square rounded-xl bg-gray-200 overflow-hidden">
            <img
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* ขวา: รายละเอียด */}
          <div className="pt-1 mt-6 ">
            <h1 className="text-2xl md:text-3xl font-extrabold text-black">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                {product.description}
              </p>
            )}

            {/* ราคา */}
            <div className="mt-4 ">
              {product.salePrice != null ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-[28px] font-bold text-red-600">
                    {product.salePrice.toLocaleString("th-TH")} บาท
                  </span>
                  <span className="text-sm md:text-base text-gray-400 line-through">
                    {product.price.toLocaleString("th-TH")} บาท
                  </span>
                </div>
              ) : (
                <div className="text-2xl md:text-[28px] font-bold text-black">
                  {product.price.toLocaleString("th-TH")} บาท
                </div>
              )}
            </div>

            {/* สต็อก */}
            <p className="mt-4 text-sm text-gray-600">
              คงเหลือในคลังสินค้า{" "}
              <span className="font-medium text-black">{product.stock}</span>{" "}
              ชิ้น
            </p>

            {/* จำนวน + ปุ่มเพิ่มตะกร้า */}
            <div className="mt-5 flex items-center gap-4 ">
              <span className="text-sm text-gray-700">จำนวน</span>

              <div className="inline-flex items-center rounded-full border border-black/10 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={product.stock === 0 || qty <= 1}
                  className="grid h-9 w-9 place-items-center hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="ลดจำนวน"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="w-12 select-none text-center text-sm">
                  {qty}
                </div>

                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={product.stock === 0 || qty >= product.stock}
                  className="grid h-9 w-9 place-items-center hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={loading || !!error || product.stock === 0}
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-xl px-5 md:px-20 py-2.5 text-sm font-semibold",
                  "bg-red-600 text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]",
                  "hover:bg-red-700 active:bg-red-800",
                  "focus:outline-none focus:ring-2 focus:ring-red-200",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
                aria-label="เพิ่มลงตะกร้า"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.stock === 0
                    ? t("cannotBuy")
                    : loading
                    ? t("adding")
                    : t("addToCart")}
                </span>
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <hr className="mt-8 mb-4 border-t border-gray-200 " />

            {/* การจัดส่ง */}
            <section className="mt-2">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">
                การจัดส่ง
              </h2>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Truck className="h-6 w-6 text-gray-700" strokeWidth={1.75} />
                <div>
                  <div>ค่าจัดส่ง 30 บาท จัดส่งโดย ไปรษณีย์ไทย</div>
                  <div className="text-gray-500">
                    จะได้รับสินค้าภายใน {formatDeliveryRange()}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function formatDeliveryRange() {
  const start = new Date();
  start.setDate(start.getDate() + 3);
  const end = new Date();
  end.setDate(end.getDate() + 5);

  const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const th = new Intl.DateTimeFormat("th-TH", fmt);
  return `${th.format(start)} - ${th.format(end)}`;
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async ({
  params,
  locale,
}) => {
  const id = params?.id as string;
  const lang = locale ?? "th";

  const raw = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: { where: { locale: lang }, take: 1 },
    },
  });
  if (!raw) {
    return { props: { product: null } };
  }

  const trans = raw.translations[0];
  return {
    props: {
      product: {
        id: raw.id,
        name: trans?.name ?? "",
        description: trans?.description ?? "",
        price: raw.price,
        salePrice: raw.salePrice,
        stock: raw.stock,
        imageUrl: raw.imageUrl,
      },
    },
  };
};

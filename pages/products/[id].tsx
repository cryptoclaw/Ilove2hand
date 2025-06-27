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

interface ProductPageProps {
  product:
    | {
        id: string;
        name: string;
        description: string;
        price: number;
        salePrice: number | null;
        stock: number;
        imageUrl: string | null;
      }
    | null;
}

export default function ProductPage({ product }: ProductPageProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { token } = useAuth();

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
    if (!token) {
      router.push("/login");
      return;
    }
    if (error || product.stock === 0) return;
    setLoading(true);
    try {
      const cartRes = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cartRes.ok) throw new Error(t("cartFetchError"));
      const { items } = await cartRes.json();
      const inCart = items.find((i: any) => i.productId === product.id);
      const current = inCart?.quantity ?? 0;
      if (current + qty > product.stock) {
        setError(t("maxInCart", { stock: product.stock, current }));
        setLoading(false);
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (!res.ok) throw new Error(t("addCartError"));
      router.push("/cart");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={product.name}>
      <div className="w-full max-w-6xl mx-auto px-8 py-10 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* ภาพสินค้า */}
          <div>
            <img
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* รายละเอียดสินค้า */}
          <div>
            <h1 className="text-4xl font-extrabold mb-4">{product.name}</h1>
            <p className="text-gray-700 mb-6">{product.description}</p>

            {product.salePrice != null ? (
              <div className="flex items-baseline space-x-4 mb-6">
                <span className="text-3xl text-red-600 font-bold">
                  ฿ {product.salePrice}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ฿ {product.price}
                </span>
              </div>
            ) : (
              <p className="text-3xl text-green-700 mb-6">
                ฿ {product.price}
              </p>
            )}

            <p className="mb-4 text-sm text-gray-500">
              {t("stock")}: {product.stock}
            </p>

            {product.stock === 0 ? (
              <p className="text-red-600 font-semibold">{t("outOfStock")}</p>
            ) : (
              <div className="mb-6">
                <label className="block mb-1 text-sm">{t("quantity")}:</label>
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            )}

            <button
              onClick={addToCart}
              disabled={loading || !!error || product.stock === 0}
              className={`px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${
                loading || error || product.stock === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {product.stock === 0
                ? t("cannotBuy")
                : loading
                ? t("adding")
                : t("addToCart")}
            </button>

            <div className="mt-8">
              <Link href="/" className="text-blue-600 hover:underline text-sm">
                ← {t("backHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<
  ProductPageProps
> = async ({ params, locale }) => {
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

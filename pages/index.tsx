// pages/index.tsx
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import Banner, { BannerSlide } from "@/components/Banner";
import CategoryCarousel from "@/components/CategoryCarousel";
import DiscountCarousel from "@/components/DiscountCarousel";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Category, Product } from "@/types/product";
import SubBanner from "@/components/SubBanner";

interface HomeProps {
  banners: BannerSlide[];
  featured: Product[];
  onSale: Product[];
  categories: Category[];
}

export default function HomePage({
  banners,
  featured,
  onSale,
  categories,
}: HomeProps) {
  // Hero banner
  const heroSlides: BannerSlide[] = banners;

  // Promotion banner จากสินค้า on sale
  const promoSlides: BannerSlide[] = onSale.map((p) => ({
    title: p.name,
    sub: p.description ?? "",
    img: p.imageUrl ?? "/images/placeholder.png",
  }));

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="py-8 px-4">
        <Banner slides={heroSlides} />
      </section>

      {/* Category Carousel */}
      <section className="px-4">
        <CategoryCarousel categories={categories} />
      </section>

      {/* On Sale Carousel */}
      <section className="py-8 px-4">
        <DiscountCarousel items={onSale} />
      </section>

      {/* Promotion Sub-Banner */}
      <section className="py-8 px-4">
        <SubBanner />
      </section>

      {/* Featured Products */}
      <section className="py-8 px-4">
        <h2 className="text-xl font-semibold mb-4">สินค้าแนะนำ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // 1. ดึง banners จาก DB
  const rawBanners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });
  const banners: BannerSlide[] = rawBanners.map((b) => ({
    title: b.title ?? "",
    sub: b.sub ?? "",
    img: b.imageUrl,
  }));

  // 2. ดึง featured products (เฉพาะที่ isFeatured = true)
  const rawFeatured = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  const featured: Product[] = rawFeatured.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
    isFeatured: p.isFeatured,
  }));

  // 3. ดึง onSale products
  const rawOnSale = await prisma.product.findMany({
    where: { salePrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  const onSale: Product[] = rawOnSale.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice!,
    isFeatured: p.isFeatured,
  }));

  // 4. ดึง categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return {
    props: { banners, featured, onSale, categories },
  };
};

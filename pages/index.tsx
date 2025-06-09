// pages/index.tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Banner, { BannerSlide } from "@/components/Banner";
import CategoryCarousel from "@/components/CategoryCarousel";
import DiscountCarousel from "@/components/DiscountCarousel";
import SubBanner from "@/components/SubBanner";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Category, Product } from "@/types/product";

interface HomeProps {
  banners: BannerSlide[];       // Hero banners
  subBanners: BannerSlide[];    // Sub/Promotion banners
  featured: Product[];          // สินค้าแนะนำ
  onSale: Product[];            // สินค้าลดราคา
  bestSellers: Product[];       // สินค้าขายดี
  categories: Category[];
}

export default function HomePage({
  banners,
  subBanners,
  featured,
  onSale,
  bestSellers,
  categories,
}: HomeProps) {
  return (
    <Layout>
      {/* Hero Banner */}
      <section className="container py-2">
        <Banner slides={banners} />
      </section>

      {/* Category Carousel */}
      <section className="container py-2">
        <CategoryCarousel categories={categories} />
      </section>

      {/* On Sale Carousel */}
      <section className="container py-2">
        <DiscountCarousel items={onSale} />
      </section>

      {/* Legacy SubBanner Component */}
      <section className="container py-2">
        <SubBanner />
      </section>

      {/* Custom Promotion/Sub Banner */}
      <section className="container py-2">
        <Banner slides={subBanners} isPromotion />
      </section>

      {/* Best Sellers */}
      <section className="container py-2">
        <h2 className="text-xl font-semibold mb-4">สินค้าขายดี</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-10">
        <h2 className="text-xl font-semibold mb-4">สินค้าแนะนำ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // 1. Hero banners
  const rawHero = await prisma.banner.findMany({
    where: { position: "hero" },
    orderBy: { order: "asc" },
  });
  const banners: BannerSlide[] = rawHero.map((b) => ({
    title: b.title ?? "",
    sub: b.sub ?? "",
    img: b.imageUrl,
  }));

  // 2. Sub/promotional banners
  const rawSub = await prisma.banner.findMany({
    where: { position: "sub" },
    orderBy: { order: "asc" },
  });
  const subBanners: BannerSlide[] = rawSub.map((b) => ({
    title: b.title ?? "",
    sub: b.sub ?? "",
    img: b.imageUrl,
  }));

  // 3. Featured products
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

  // 4. On-sale products
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

  // 5. Best sellers: groupBy orderItem.quantity แล้วเรียง desc, เอา top 8
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });
  // ดึงข้อมูล product มาตามลำดับ
  const bestSellers: Product[] = await Promise.all(
    top.map(async (t) => {
      const p = await prisma.product.findUnique({ where: { id: t.productId } });
      return {
        id: p!.id,
        name: p!.name,
        description: p!.description,
        price: p!.price,
        imageUrl: p!.imageUrl,
        stock: p!.stock,
        salePrice: p!.salePrice ?? null,
        isFeatured: p!.isFeatured,
      };
    })
  );

  // 6. Categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return {
    props: { banners, subBanners, featured, onSale, bestSellers, categories },
  };
};

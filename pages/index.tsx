// pages/index.tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Banner, { BannerSlide } from "@/components/Banner";
import CategoryCarousel from "@/components/CategoryCarousel";
import DiscountCarousel from "@/components/DiscountCarousel";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product, Category } from "@/types/product";

interface HomeProps {
  featured: Product[];
  onSale: Product[];
  categories: Category[];
}

export default function HomePage({ featured, onSale, categories }: HomeProps) {
  // 1. Hero banner
  const heroSlides: BannerSlide[] = featured.slice(0, 3).map((p) => ({
    title: p.name,
    sub: "Best Deal Online on smart watches",
    img: p.imageUrl ?? "/images/placeholder.png",
  }));

  // 2. Promotion banner
  const promoSlides: BannerSlide[] = [
    { title: "Promotion", sub: "UP to 80% OFF", img: "/images/banner1.png" },
    { title: "Promotion", sub: "UP to 80% OFF", img: "/images/banner2.png" },
    { title: "Promotion", sub: "UP to 80% OFF", img: "/images/banner3.jpg" },
  ];

  // 3. Other products (filtered)
  const otherProducts = [...featured, ...onSale]
    .reduce<Product[]>((acc, p) => {
      if (!acc.find((x) => x.id === p.id)) acc.push(p);
      return acc;
    }, [])
    .slice(0, 8);

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="py-8 px-4">
        <Banner slides={heroSlides} />
      </section>

      {/* Category Carousel (moved above on-sale) */}
      <section className="px-4">
        <CategoryCarousel categories={categories} />
      </section>

      {/* On Sale Products */}
      <section className="py-8 px-4">
        <DiscountCarousel items={onSale} />
      </section>

      {/* Promotion Banner */}
      <section className="py-8 px-4">
        <Banner slides={promoSlides} isPromotion />
      </section>

      {/* Featured */}
      <section className="py-8 px-4">
        <h2 className="text-xl font-semibold mb-4">แนะนำสำหรับคุณ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Other Products */}
      <section className="py-8 px-4">
        <h2 className="text-xl font-semibold mb-4">สินค้าอื่น ๆ ที่น่าสนใจ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {otherProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // Featured
  const rawFeatured = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
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
  }));

  // On Sale
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
  }));

  // Categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return {
    props: { featured, onSale, categories },
  };
};

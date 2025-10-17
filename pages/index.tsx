// pages/index.tsx
import type { GetServerSideProps } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Layout from "@/components/Layout";
import Banner, { BannerSlide } from "@/components/Banner";
import CategoryCarousel from "@/components/CategoryCarousel";
import SubBanner from "@/components/SubBanner";
import ProductCard from "@/components/ProductCard";
import CouponsCarousel from "@/components/CouponsCarousel";
import { prisma } from "@/lib/prisma";
import type { Category, Product } from "@/types/product";
import Image from "next/image";
import AuctionGrid, { AuctionCardItem } from "@/components/AuctionGrid";

/** โหลดคอมโพเนนต์ที่หนักแบบ dynamic พร้อมสเกลเลตัน */
const DiscountCarousel = dynamic(
  () => import("@/components/DiscountCarousel"),
  {
    ssr: false,
    loading: () => <CarouselSkeleton />,
  }
);

type AuctionLite = {
  id: string;
  title: string;
  img: string | null;
  currentPrice: number;
  endsAt: string; // ISO
};

type HomeProps = {
  banners: BannerSlide[]; // Hero banners
  subBanners: BannerSlide[]; // Sub/Promotion banners
  featured: Product[]; // สินค้าแนะนำ
  onSale: Product[]; // สินค้าลดราคา
  bestSellers: Product[]; // สินค้าขายดี
  categories: Category[];
  subBannerData: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    img: string;
  } | null;
  auctions: AuctionLite[]; // ✅ สินค้าประมูล
  readyToShip: Product[]; // ✅ สินค้าพร้อมส่ง (stock > 0)
};

/* -------------------------- UI helpers -------------------------- */

function Section({
  title,
  href,
  children,
  className = "",
  pad = "dense", // 'dense' | 'normal' | 'loose'
}: {
  title?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  pad?: "dense" | "normal" | "loose";
}) {
  const padCls =
    pad === "dense"
      ? "py-2 md:py-2"
      : pad === "normal"
      ? "py-6 md:py-8"
      : "py-8 md:py-10";

  return (
    <section className={`container ${padCls} ${className}`}>
      {title ? (
        <div className="mb-3 md:mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          {href ? (
            <Link
              href={href}
              className="text-sm md:text-base text-gray-600 hover:text-gray-900 underline underline-offset-4"
            >
              ดูทั้งหมด
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-44 md:h-56 rounded-xl bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ---------------------- In-file Auction Grid --------------------- */

function fmtTHB(n: number) {
  return n.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  });
}

function timeLeft(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ปิดประมูลแล้ว";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}ชม ${mm}นาที`;
  return `${mm} นาที`;
}

/* ----------------------------- Page ----------------------------- */

export default function HomePage({
  banners = [],
  subBanners = [],
  featured = [],
  onSale = [],
  bestSellers = [],
  categories = [],
  subBannerData = null,
  auctions = [],
  readyToShip = [],
}: HomeProps) {
  const { t } = useTranslation("common");
  const siteTitle = t("siteTitle");

  return (
    <Layout title={siteTitle}>
      {/* SEO: ใส่ JSON-LD แบบย่อสำหรับสินค้าขายดี */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `${siteTitle} – Home`,
              itemListElement: (bestSellers ?? [])
                .slice(0, 8)
                .map((p, idx) => ({
                  "@type": "Product",
                  position: idx + 1,
                  name: p.name,
                  image: p.imageUrl,
                  offers: {
                    "@type": "Offer",
                    price: p.salePrice ?? p.price,
                    priceCurrency: "THB",
                    availability: p.stock > 0 ? "InStock" : "OutOfStock",
                  },
                })),
            }),
          }}
        />
      </Head>

      {/* ✅ 1) สินค้าประมูล */}
      <Section
        title="สินค้าประมูล"
        href="/auctions"
        pad="dense"
        className="mt-10"
      >
        <AuctionGrid items={auctions} />
      </Section>

      {/* ✅ 2) สินค้าลดราคา */}
      <Section pad="dense">
        {onSale?.length ? (
          <DiscountCarousel items={onSale} />
        ) : (
          <EmptyState text="ยังไม่มีสินค้าโปรโมชัน" />
        )}
      </Section>

      {/* ✅ 3) สินค้าพร้อมส่ง */}
      <Section
        title="สินค้าพร้อมส่ง"
        href="/all-products?inStock=1"
        pad="dense"
      >
        {readyToShip?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {readyToShip.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState text="ยังไม่มีสินค้าพร้อมส่ง" />
        )}
      </Section>

      {/* แบนเนอร์โปรโมชันย่อย
      {subBanners?.length ? (
        <Section pad="dense">
          <Banner slides={subBanners} isPromotion />
        </Section>
      ) : null} */}

      {/* ส่วนอื่น ๆ ที่คอมเมนต์ไว้คงเดิม */}
    </Layout>
  );
}

/* ----------------------------- SSR ----------------------------- */

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  locale,
}) => {
  const lang = locale ?? "th";

  // 1. Hero banners
  const rawHero = await prisma.bannerLocale.findMany({
    where: { locale: lang },
    include: { banner: true },
    orderBy: { banner: { order: "asc" } },
  });
  const banners: BannerSlide[] = rawHero.map(({ title, sub, banner }) => ({
    title: title ?? "",
    sub: sub ?? "",
    img: banner.imageUrl,
  }));

  // 2. Promotion banners
  const rawPromo = await prisma.bannerLocale.findMany({
    where: { locale: lang, banner: { position: "sub" } },
    include: { banner: true },
    orderBy: { banner: { order: "asc" } },
  });
  const subBanners: BannerSlide[] = rawPromo.map(({ title, sub, banner }) => ({
    title: title ?? "",
    sub: sub ?? "",
    img: banner.imageUrl,
  }));

  // helper: fetch localized products
  async function getProducts(where: any, take?: number) {
    const raw = await prisma.product.findMany({
      where,
      take,
      orderBy: { updatedAt: "desc" },
      include: { translations: { where: { locale: lang }, take: 1 } },
    });
    return raw.map((p) => ({
      id: p.id,
      name: p.translations?.[0]?.name ?? "",
      description: p.translations?.[0]?.description ?? "",
      price: p.price,
      imageUrl: p.imageUrl,
      stock: p.stock,
      salePrice: p.salePrice ?? null,
      isFeatured: p.isFeatured,
    }));
  }

  // 3. Featured
  const featured = await getProducts({ isFeatured: true }, 6);

  // 4. On Sale
  const onSale = await getProducts({ salePrice: { not: null } }, 8);

  // 5. Best Sellers
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });
  const bestSellers: Product[] = await Promise.all(
    top.map(async ({ productId }) => {
      const p = await prisma.product.findUnique({
        where: { id: productId },
        include: { translations: { where: { locale: lang }, take: 1 } },
      });
      return {
        id: p!.id,
        name: p!.translations?.[0]?.name ?? "",
        description: p!.translations?.[0]?.description ?? "",
        price: p!.price,
        imageUrl: p!.imageUrl,
        stock: p!.stock,
        salePrice: p!.salePrice ?? null,
        isFeatured: p!.isFeatured,
      };
    })
  );

  // 6. Categories
  const rawCats = await prisma.categoryLocale.findMany({
    where: { locale: lang },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCats.map(({ category, name }) => ({
    id: category.id,
    name,
  }));

  // 7. Legacy SubBanner
  const rawSub = await prisma.subBannerLocale.findFirst({
    where: { locale: lang },
    include: { subBanner: true },
  });
  const subBannerData = rawSub
    ? {
        title: rawSub.title,
        description: rawSub.description,
        buttonText: rawSub.buttonText,
        buttonLink: rawSub.subBanner.buttonLink,
        img: rawSub.subBanner.imageUrl ?? "",
      }
    : null;

  // 8. Auctions (กำลังเปิดอยู่ จัดเรียงใกล้ปิดก่อน)
  const rawAuctions = await prisma.auction.findMany({
    where: { endAt: { gt: new Date() } }, // หรือ { status: "OPEN" }
    orderBy: { endAt: "asc" },
    take: 10,
    include: {
      product: {
        include: { translations: { where: { locale: lang }, take: 1 } },
      },
      bids: {
        select: { amount: true },
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
  } as any);

  const auctions: AuctionLite[] = (rawAuctions as any[]).map((a) => {
    const title =
      a.title ||
      a.product?.translations?.[0]?.name ||
      a.product?.name ||
      "รายการประมูล";
    const img = a.imageUrl ?? a.product?.imageUrl ?? null;
    const currentPrice =
      a.bids?.[0]?.amount ?? a.currentPrice ?? a.startPrice ?? 0;
    return {
      id: a.id,
      title,
      img,
      currentPrice,
      endsAt: (a.endAt ?? new Date()).toISOString(),
    };
  });

  // 9. Ready to ship: สินค้าที่ stock > 0
  const readyToShip = await getProducts({ stock: { gt: 0 } }, 10);

  return {
    props: {
      banners: banners ?? [],
      subBanners: subBanners ?? [],
      featured: featured ?? [],
      onSale: onSale ?? [],
      bestSellers: bestSellers ?? [],
      categories: categories ?? [],
      subBannerData: subBannerData ?? null,
      auctions: auctions ?? [],
      readyToShip: readyToShip ?? [],
    },
  };
};

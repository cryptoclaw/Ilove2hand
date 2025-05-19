"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PromoModal from "./PromoModal";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({
  children,
  title = "ICN_FREEZE",
}: LayoutProps) {
  // state ควบคุมการโชว์โปรโมชัน
  const [showPromo, setShowPromo] = useState(false);

  // เช็ก localStorage ครั้งแรก ถ้ายังไม่เคยโชว์ ให้แสดง modal แล้วเซ็ต flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("promoShown");
      if (!seen) {
        setShowPromo(true);
        localStorage.setItem("promoShown", "true");
      }
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="ตลาดสินค้าเกษตรสดใหม่ ICN_FREEZE" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navbar ชิดบนสุด */}
      <header>
        <Navbar />
      </header>
      {/* แสดง modal โปรโมชัน */}
      <PromoModal show={showPromo} onClose={() => setShowPromo(false)} />
        

      {/* เนื้อหาแต่ละหน้าหลัก ให้มี padding ด้านข้างตามดีไซน์ */}
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer กว้างเต็มจอ */}
      <Footer />
    </div>
  );
}

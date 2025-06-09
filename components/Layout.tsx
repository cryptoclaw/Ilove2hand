// components/Layout.tsx
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PromoModal from "./PromoModal";
import CookieConsent from "./CookieConsent"; // import component cookie consent
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
  // state ควบคุมการโชว์ popup cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // ตรวจสอบ promo modal
      const seenPromo = localStorage.getItem("promoShown");
      if (!seenPromo) {
        setShowPromo(true);
        localStorage.setItem("promoShown", "true");
      }
      const cookieConsent = localStorage.getItem("cookieConsent");
      if (!cookieConsent) {
        setShowCookieConsent(true);
      }
    }
  }, []);

  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem("cookieConsent", accepted ? "true" : "false");
    setShowCookieConsent(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="ตลาดสินค้าเกษตรสดใหม่ ICN_FREEZE"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 1) fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>

      {/* 2) promo + cookie */}
      <PromoModal show={showPromo} onClose={() => setShowPromo(false)} />
      {showCookieConsent && (
        <CookieConsent
          onAccept={() => handleCookieConsent(true)}
          onDecline={() => handleCookieConsent(false)}
        />
      )}

      {/* 3) ดันเนื้อหาไม่ให้ทับด้วย margin-top */}
      <main
        className="
          flex-grow w-full max-w-screen-xl mx-auto
          px-4 sm:px-6 lg:px-8 py-8
          mt-16 sm:mt-20 md:mt-24
          
        "
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}

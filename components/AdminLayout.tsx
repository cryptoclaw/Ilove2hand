"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import PromoModal from "./PromoModal";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}

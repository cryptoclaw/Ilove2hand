"use client";

import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({
  children,
  title = "ICN_FREEZE",
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="ตลาดสินค้าเกษตรสดใหม่ ICN_FREEZE" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className="container mx-auto p-4">{children}</main>

      <Footer />
    </>
  );
}

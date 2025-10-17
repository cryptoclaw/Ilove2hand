// src/components/Navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Truck, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";
import useTranslation from "next-translate/useTranslation"; // ⬅️ เพิ่ม

type Item = { label: string; href: string };

const items: Item[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "สินค้าประมูล", href: "/auctions" },
  { label: "สินค้าพร้อมส่ง", href: "/all-products" },
];

function GuestActions() {
  return (
    <>
      <Link
        href="/register"
        className={[
          "rounded-full px-3.5 py-1.5 text-xs font-semibold",
          "border border-slate-300 text-slate-800 bg-white",
          "hover:border-red-300 hover:text-red-600 hover:bg-white/70",
          "focus:outline-none focus:ring-2 focus:ring-red-100",
          "transition-colors",
        ].join(" ")}
        aria-label="ไปหน้า ลงทะเบียน"
      >
        ลงทะเบียน
      </Link>

      <Link
        href="/login"
        className={[
          "rounded-full px-3.5 py-1.5 text-xs font-semibold text-white",
          "bg-gradient-to-b from-red-600 to-red-600/90",
          "shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]",
          "hover:from-red-600 hover:to-red-700",
          "active:from-red-700 active:to-red-800",
          "focus:outline-none focus:ring-4 focus:ring-red-200",
          "transition-colors",
        ].join(" ")}
        aria-label="ไปหน้า เข้าสู่ระบบ"
      >
        เข้าสู่ระบบ
      </Link>
    </>
  );
}

/* ---------- สวิตช์ภาษา TH/EN (เดสก์ท็อป) ---------- */
function LangSwitchDesktop() {
  const pathname = usePathname();
  const { lang } = useTranslation();

  const base =
    "px-2 py-1 text-xs font-semibold rounded border transition-colors";
  const on = "bg-red-600 text-white border-red-600";
  const off = "text-slate-700 border-slate-300 hover:bg-slate-100";

  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href={pathname}
        locale="th"
        className={`${base} ${lang === "th" ? on : off}`}
      >
        TH
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`${base} ${lang === "en" ? on : off}`}
      >
        EN
      </Link>
    </div>
  );
}

function UserActions() {
  const { user, logout } = useAuth();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // ✅ เพิ่ม 2 hook นี้เพื่อทำสวิตช์ภาษา
  const pathname = usePathname();
  const { lang } = useTranslation();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpenUserMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* tracking */}
      {/* <Link
        href="/orders"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="ติดตามพัสดุ"
        title="ติดตามพัสดุ"
      >
        <Truck className="h-5 w-5 text-gray-800 hover:text-red-600 transition-colors" />
      </Link> */}

      {/* cart */}
      <Link
        href="/cart"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="ตะกร้าสินค้า"
        title="ตะกร้าสินค้า"
      >
        <ShoppingCart className="h-5 w-5 text-gray-800 hover:text-red-600 transition-colors" />
      </Link>

      {/* ✅ สวิตช์ภาษา: อยู่ขวาของตะกร้า ซ้ายของโปรไฟล์ */}
      {/* <div className="hidden md:flex items-center gap-2 mx-1">
        <Link
          href={pathname}
          locale="th"
          className={[
            "px-2 py-1 text-xs font-semibold rounded border transition-colors",
            lang === "th"
              ? "bg-red-600 text-white border-red-600"
              : "text-slate-700 border-slate-300 hover:bg-slate-100",
          ].join(" ")}
        >
          TH
        </Link>
        <Link
          href={pathname}
          locale="en"
          className={[
            "px-2 py-1 text-xs font-semibold rounded border transition-colors",
            lang === "en"
              ? "bg-red-600 text-white border-red-600"
              : "text-slate-700 border-slate-300 hover:bg-slate-100",
          ].join(" ")}
        >
          EN
        </Link>
      </div> */}

      {/* ปุ่ม + เมนูโปรไฟล์ */}
      <div className="relative" ref={boxRef}>
        <button
          onClick={() => setOpenUserMenu((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={openUserMenu}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50 hover:border-red-600"
        >
          <Avatar
            src={(user as any)?.avatarUrl}
            name={user?.name || user?.email}
            size={22}
          />
          <span className="truncate max-w-[120px] text-sm">
            {user?.name ?? user?.email}
          </span>
        </button>

        <div
          role="menu"
          className={[
            "absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg",
            openUserMenu ? "block" : "hidden",
          ].join(" ")}
        >
          <Link
            href="/account"
            className="block px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
          >
            โปรไฟล์ของฉัน
          </Link>
          {/* <Link
            href="/account/auctions"
            className="block px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
          >
            การประมูลของฉัน
          </Link> */}
          <Link
            href="/orders"
            className="block px-3 py-2 text-sm hover:bg-gray-50"
            role="menuitem"
          >
            คำสั่งซื้อของฉัน
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="h-0.5 w-full bg-red-600" />

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 md:h-16 md:px-5">
        {/* โลโก้ */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-7 w-36">
            <Image
              src="/images/logo_nav.png"
              alt="I ❤️ 2hand"
              fill
              className="object-contain select-none"
              priority
            />
          </div>
        </Link>

        {/* Desktop menu */}
        <nav className="ml-3 hidden items-center gap-7 md:flex">
          {items.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative text-sm text-gray-600 tracking-tight transition-colors",
                  "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full",
                  "after:bg-red-600 after:transition-[width] after:duration-200",
                  "hover:text-black hover:after:w-full",
                  isActive ? "font-semibold text-black after:w-full" : "",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ขวา (เดสก์ท็อป) */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? <UserActions /> : <GuestActions />}
        </div>

        {/* Hamburger (มือถือ) */}
        <button
          aria-label="Toggle menu"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-black transition" />
          <span className="mt-1 block h-0.5 w-5 bg-black transition" />
          <span className="mt-1 block h-0.5 w-5 bg-black transition" />
        </button>
      </div>

      {/* เมนูมือถือ */}
      <div
        className={[
          "md:hidden grid transition-[grid-template-rows] duration-300",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="overflow-hidden border-t border-gray-200 bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-2">
            {items.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "block rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "font-semibold text-black bg-red-50 ring-1 ring-red-600/20"
                      : "text-gray-700 hover:text-black hover:bg-gray-50",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}

            {/* สวิตช์ภาษา (มือถือ) */}
            <LangSwitchMobile />

            {/* ปุ่มทางขวาบนมือถือ */}
            <div className="mt-3 border-t border-gray-200 pt-3 flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
                  >
                    ติดตามพัสดุ
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
                  >
                    ตะกร้า
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
                  >
                    โปรไฟล์
                  </Link>
                </>
              ) : (
                <GuestActions />
              )}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
}

/* ---------- สวิตช์ภาษา (มือถือ) แยก component ---------- */
function LangSwitchMobile() {
  const pathname = usePathname();
  const { lang } = useTranslation();

  const base =
    "px-2 py-1 mr-2 text-xs font-semibold rounded border transition-colors";
  const on = "bg-red-600 text-white border-red-600";
  const off = "text-slate-700 border-slate-300 hover:bg-slate-100";

  return (
    <div className="mt-3 flex items-center">
      <Link
        href={pathname}
        locale="th"
        className={`${base} ${lang === "th" ? on : off}`}
      >
        TH
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`${base} ${lang === "en" ? on : off}`}
      >
        EN
      </Link>
    </div>
  );
}

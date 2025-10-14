// components/AdminSidebar.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  BarChart2,
  Settings,
  ClipboardList,
  Truck,
  Tag,
  MessageSquare,
  LogOut,
  Gavel, // ✅ ไอคอนประมูล
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | null;
};

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { adminLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ นับจำนวน LIVE auctions (ดึงจาก public API ก็พอสำหรับ badge)
  const [liveCount, setLiveCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/auctions?status=LIVE")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setLiveCount(Array.isArray(list) ? list.length : 0))
      .catch(() => setLiveCount(null));
  }, []);

  // ✅ เพิ่มเมนู Auctions
  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/admin/dashboard", icon: <BarChart2 size={20} /> },
      { label: "Edited Pages", href: "/admin/home-manage", icon: <Settings size={20} /> },
      { label: "Order Management", href: "/admin/orders", icon: <ClipboardList size={20} /> },
      { label: "Suppliers", href: "/admin/suppliers", icon: <Truck size={20} /> },
      { label: "Coupon", href: "/admin/coupons", icon: <Tag size={20} /> },
      { label: "Contact", href: "/admin/qa", icon: <MessageSquare size={20} /> },
      // 🔥 เมนูจัดการประมูล
      { label: "Auctions", href: "/admin/auctions", icon: <Gavel size={20} />, badge: liveCount },
    ],
    [liveCount]
  );

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  // ✅ ให้ active ครอบคลุมเส้นทางย่อย เช่น /admin/auctions/[id]
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const renderItem = (item: NavItem, isMobile = false) => {
    const active = isActive(item.href);
    const base =
      (isMobile
        ? active
          ? "bg-white text-green-800"
          : "text-white hover:bg-green-600"
        : active
          ? "bg-white text-green-800"
          : "text-white hover:bg-green-600") +
      " flex items-center justify-between px-3 py-2 rounded-md transition-colors";

    return (
      <Link key={item.href} href={item.href} className={base}>
        <span className="flex items-center space-x-3">
          {item.icon}
          <span>{item.label}</span>
        </span>
        {/* badge แสดงจำนวน LIVE */}
        {typeof item.badge === "number" && (
          <span className="ml-3 inline-flex items-center justify-center text-xs font-semibold min-w-5 h-5 px-2 rounded-full bg-white/20 text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile header + dropdown */}
      <div className="md:hidden bg-green-800 text-white">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="p-2 rounded-md hover:bg-green-700 transition"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="bg-green-700 px-4 pb-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {renderItem(item, true)}
                </div>
              ))}
            </nav>
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-red-600 px-3 py-2 rounded-md hover:bg-red-700 transition"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col justify-between bg-green-800 text-white p-6 w-64 h-screen">
        <div>
          <div className="mb-8 flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-green-800 font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-semibold">ICONNEX THAILAND</span>
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => renderItem(item))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center space-x-2 bg-red-600 px-3 py-2 rounded-md hover:bg-red-700 transition"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}

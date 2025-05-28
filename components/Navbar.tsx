// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", href: "/" },
    { label: "สินค้า", href: "/all-products" },
    { label: "เกี่ยวกับเรา", href: "/contact" },
    { label: "Q/A", href: "/qa" },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 lg:px-8">
        {/* ตั้งความสูง navbar ให้พอเหมาะ (96px) */}
        <div className="flex items-center justify-between h-24">
          {/* 1. Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="ICN_FREEZE Logo"
              width={100} // ปรับให้ใหญ่ขึ้น
              height={100}
            />
          </Link>

          {/* 2. Nav Links + Language */}
          <div className="flex items-center space-x-8">
            {/* Nav Links */}
            <ul className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-1 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-green-600 text-white"
                          : "text-gray-700 hover:text-green-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Language Switcher */}
            <div className="flex items-center space-x-2 text-sm font-medium">
              <Link
                href="/?lang=th"
                className={`px-2 py-1 rounded ${
                  pathname.includes("lang=th")
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                TH
              </Link>
              <Link
                href="/?lang=en"
                className={`px-2 py-1 rounded ${
                  pathname.includes("lang=en")
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                EN
              </Link>
            </div>
          </div>

          {/* 3. Icons & Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/orders" className="text-gray-600 hover:text-green-600">
              <Heart size={24} />
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-green-600">
              <ShoppingCart size={24} />
            </Link>
            {user ? (
              <>
                <span className="hidden md:inline text-gray-700">
                  สวัสดี, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm text-gray-700 rounded-md hover:text-green-600 transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

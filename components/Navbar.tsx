// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Product", href: "/all-products" },
    { label: "Contact", href: "/contact" },
    { label: "Q/A", href: "/qa" },
  ];

  return (
    <nav className="bg-green-100 p-4 flex justify-between items-center">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.png" // พาธไปยังไฟล์รูปโลโก้ใน public/
          alt="ICN_FREEZE Logo"
          width={120} // ปรับขนาดตามต้องการ
          height={40}
          className="object-contain"
        />
      </Link>

      {/* Center: Nav Links */}
      <div className="flex space-x-4">
        {navItems.map((item) => {
          const isActive = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-green-800 hover:bg-green-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Cart + Auth */}
      <div className="flex items-center space-x-4">
        {/* Cart icon */}
        <Link href="/cart" className="text-green-800 hover:text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13l-1.5-7M7 13h10m-6 8a1 1 0 100-2 1 1 0 000 2m6-1a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </Link>

        {user ? (
          <>
            <span className="text-green-800">สวัสดี, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-green-800 hover:bg-green-200 px-3 py-1 rounded"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

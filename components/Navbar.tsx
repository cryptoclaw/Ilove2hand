// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/all-products" },
  { label: "Contact", href: "/contact" },
  { label: "Q/A", href: "/qa" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname(); // Next 13+ router hook

  return (
    <nav className="bg-green-100 p-4 flex justify-between items-center">
      {/* Left: brand as logo image */}
      <Link href="/" className="flex items-center">
        <img src="/images/logo.png" alt="ICN_FREEZE" className="h-20 w-auto" />
      </Link>

      {/* Center: nav links */}
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

      {/* Right: auth */}
      <div className="flex items-center space-x-4">
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

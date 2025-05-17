// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-xl">
        ICN_FREEZE
      </Link>
      <div className="space-x-4">
        {user ? (
          <>
            <span>สวัสดี, {user.name}</span>
            <Link href="/cart" className="hover:underline">
              Cart
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
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

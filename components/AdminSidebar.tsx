"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login"); // หลัง logout redirect ไปหน้า login
  };

  return (
    <div className="w-64 h-screen bg-gray-100 flex flex-col justify-between p-4">
      <nav className="space-y-4">
        <Link
          href="/admin/home-manage"
          className="block px-3 py-2 rounded hover:bg-green-600 hover:text-white"
        >
          Home Manage
        </Link>
        <Link
          href="/admin/coupons"
          className="block px-3 py-2 rounded hover:bg-green-600 hover:text-white"
        >
          Coupons
        </Link>
        <Link
          href="/admin/qa"
          className="block px-3 py-2 rounded hover:bg-green-600 hover:text-white"
        >
          Q/A
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}

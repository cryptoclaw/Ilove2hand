"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart2,
  Settings,
  ClipboardList,
  Truck,
  Tag,
  MessageSquare,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const { adminLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ฟังก์ชัน logout และ redirect ไปหน้า adlogin
  const handleLogout = () => {
    adminLogout();
    // หลัง logout redirect ไปหน้า login
  };

  // ฟังก์ชันเช็คว่า path ปัจจุบันคืออะไร
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 h-screen bg-green-800 text-white flex flex-col justify-between p-6">
      {/* ส่วนบน: โลโก้ และเมนู */}
      <div>
        {/* โลโก้ */}
        <div className="mb-10 flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-green-800 font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-semibold">ICONNEX THAILAND</span>
        </div>

        {/* เมนูนำทาง */}
        <nav className="space-y-6">
          <Link
            href="/admin/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/dashboard")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/home-manage"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/home-manage")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <Settings size={20} />
            <span>Edited Pages</span>
          </Link>
          <Link
            href="/admin/orders"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/order-management")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <ClipboardList size={20} />
            <span>Order Management</span>
          </Link>
          <Link
            href="/admin/suppliers"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/suppliers")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <Truck size={20} />
            <span>Suppliers</span>
          </Link>
          <Link
            href="/admin/coupons"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/coupons")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <Tag size={20} />
            <span>Coupon</span>
          </Link>
          <Link
            href="/admin/qa"
            className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
              isActive("/admin/qa")
                ? "bg-white text-green-800"
                : "text-white hover:bg-green-600"
            }`}
          >
            <MessageSquare size={20} />
            <span>Contact</span>
          </Link>
        </nav>
      </div>

      {/* ส่วนล่าง: ข้อมูลผู้ใช้และปุ่มออกจากระบบ */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center">
          {/* ถ้ามีรูป user ให้ใส่แทน svg นี้ */}
          {/* <img src={user?.avatarUrl} alt="User Avatar" /> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-green-800"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.7 0 4-1.8 4-4s-1.3-4-4-4-4 1.8-4 4 1.3 4 4 4zm0 2c-3.3 0-6 2.7-6 6v2h12v-2c0-3.3-2.7-6-6-6z" />
          </svg>
        </div>
        <div></div>
        <button
          onClick={handleLogout}
          className="ml-auto bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 transition flex items-center space-x-1.5 text-sm"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

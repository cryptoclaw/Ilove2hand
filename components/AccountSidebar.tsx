"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  type LucideIcon,
  User,
  Home,
  Gavel,
  Package,
  KeyRound,
  LogOut,
  Smile,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Item = {
  to: string;
  label: string;
  Icon: LucideIcon;
  danger?: boolean;
};

const items: Item[] = [
  { to: "/account", label: "บัญชีของฉัน", Icon: User },
  { to: "/account/address", label: "ที่อยู่ของฉัน", Icon: Home },
  { to: "/account/auctions", label: "การประมูลของฉัน", Icon: Gavel },
  { to: "/orders", label: "คำสั่งซื้อของฉัน", Icon: Package },
  { to: "/account/password", label: "เปลี่ยนรหัสผ่าน", Icon: KeyRound },
  { to: "/logout", label: "ออกจากระบบ", Icon: LogOut, danger: true },
];

export default function AccountSidebar() {
  const router = useRouter();
  const { user } = useAuth();

  // ให้ active เฉพาะเส้นทางตรงกับลิงก์ (เหมือน NavLink end)
  const isActive = (to: string) => router.asPath === to;

  return (
    <aside className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-white shadow-sm">
          <Smile className="h-5 w-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <div className="text-[11px] tracking-wide text-gray-500">สวัสดี,</div>
          <div className="font-semibold text-gray-900">
            {user?.name || "Username"}
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="p-2">
        {items.map(({ to, label, Icon, danger }) => {
          const active = isActive(to);
          return (
            <Link key={to} href={to} className="block">
              <div
                className={[
                  "mt-4 group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition",
                  active
                    ? "text-black shadow-sm border border-red-600"
                    : "text-gray-700 hover:bg-gray-50",
                  danger && !active ? "text-red-600 hover:bg-red-50" : "",
                ].join(" ")}
              >
                {/* left indicator */}
                <span
                  className={[
                    "absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full transition",
                    active
                      ? "bg-red-500 ml-1"
                      : "bg-transparent group-hover:bg-gray-200",
                  ].join(" ")}
                />
                {/* icon */}
                <Icon
                  className={[
                    "ml-2 h-4 w-4 shrink-0 transition",
                    active
                      ? "text-black"
                      : "text-gray-500 group-hover:text-gray-700",
                    danger && !active
                      ? "text-red-600 group-hover:text-red-700"
                      : "",
                  ].join(" ")}
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

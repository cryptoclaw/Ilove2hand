
import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const NavLink = ({ href, label, icon }: { href: string; label: string; icon?: ReactNode }) => {
  const router = useRouter();
  const active = router.pathname === href;
  return (
    <Link href={href} className="admin-link">
      <span style={{opacity: active ? 1 : .7}}>{icon}</span>
      <span style={{fontWeight: active ? 700 : 500}}>{label}</span>
    </Link>
  );
};

export default function AdminModern({ title, actions, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12L12 5L19 12L12 19L5 12Z" stroke="url(#g)" strokeWidth="2"/>
            <defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#6ea8fe"/><stop offset="1" stopColor="#41d6c3"/></linearGradient></defs>
          </svg>
          2Hand Admin
        </div>

        <nav className="admin-nav">
          <NavLink href="/admin/dashboard" label="Dashboard" />
          <NavLink href="/admin/orders" label="Orders" />
          <NavLink href="/admin/auctions" label="Auctions" />
          <NavLink href="/admin/home-manage" label="Home Manage" />
          <NavLink href="/admin/coupons" label="Coupons" />
          <NavLink href="/admin/qa" label="Q&A" />
        </nav>

        <div style={{marginTop:"auto", color:"var(--muted)", fontSize:12}}>
          v2 • Minimal Modern
        </div>
      </aside>

      <main>
        <div className="admin-topbar">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <h1 style={{fontSize:18, fontWeight:700, letterSpacing:.3}}>{title ?? "Admin"}</h1>
          </div>
          <div style={{display:"flex", gap:8}}>
            {actions}
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

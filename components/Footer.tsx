// components/Footer.tsx
"use client";

import useTranslation from "next-translate/useTranslation";
import Link from "next/link";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="bg-black text-white">
      {/* red accent bar */}
      <div className="h-1 w-full bg-red-600" />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* links */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-1 gap-3 text-center sm:grid-cols-2 md:grid-cols-5 md:gap-4"
        >
          <FooterLink href="/qa">{t("footer.faq")}</FooterLink>
          <FooterLink href="/contact">{t("footer.contact")}</FooterLink>
          <FooterLink href="/privacy-policy">{t("footer.privacy")}</FooterLink>
          <FooterLink href="/cookie-policy">{t("footer.cookies")}</FooterLink>
          <FooterLink href="/terms">{t("footer.terms")}</FooterLink>
        </nav>

        {/* divider */}
        <div className="my-6 h-px w-full bg-white/10" />

        {/* brand / copy */}
        <p className="text-center text-xs sm:text-sm text-white/80">
          © 2025 <span className="font-semibold text-white">I❤️2Hand</span> —
          สงวนลิขสิทธิ์
        </p>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-block rounded px-2 py-1 text-sm",
        "text-white/80 hover:text-white",
        "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60",
        "transition-colors",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

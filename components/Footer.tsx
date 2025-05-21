"use client";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
        <a href="/qa" className="hover:underline">
          คำถามที่พบบ่อย
        </a>
        <a href="/contact" className="hover:underline">
          ติดต่อเรา
        </a>
        <a href="/privacy-policy" className="hover:underline">
          ประกาศความเป็นส่วนตัวของลูกค้า
        </a>
        <a href="/cookie-policy" className="hover:underline">
          นโยบายการใช้งานคุกกี้
        </a>
        <a href="/terms" className="hover:underline">
          ข้อกำหนดและเงื่อนไข
        </a>
      </div>
      <p className="text-center text-sm mt-6">
        Copyright © {new Date().getFullYear()} Iconnex Thailand Developer.
        All Rights Reserved.
      </p>
    </footer>
  );
}

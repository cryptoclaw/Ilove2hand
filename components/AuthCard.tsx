"use client";
import Image from "next/image";

export default function AuthCard({
  children,
  imageSrc = "/images/logo_2hand.png",
  imageAlt = "Auth Illustration",
  height = 650, // ปรับทีเดียวทั้งโครงการ
}: {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  height?: number;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          {/* กำหนดความสูงกับทั้งแถว -> รูป/ฟอร์มเท่ากันเสมอ */}
          <div className={`grid grid-cols-1 md:grid-cols-2 md:h-[${height}px]`}>
            {/* ซ้าย: โลโก้แบบไม่ครอป */}
            <div className="relative h-48 md:h-full bg-white">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                // ไม่ให้โดนครอป/ยืด: แสดงเต็มพื้นที่พร้อมเว้นขอบ
                className="object-contain p-6 md:p-10"
                priority
              />
            </div>

            {/* ขวา: ฟอร์ม (จัดกึ่งกลางแนวตั้ง) */}
            <div className="p-6 md:p-10 md:h-full flex items-center">
              <div className="w-full max-w-md mx-auto">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

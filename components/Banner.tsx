// components/Banner.tsx
"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Slide {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
}

const slides: Slide[] = [
  {
    title: "กระเพราหมูกรอบๆ",
    subtitle: "UP to 80% OFF",
    imageUrl: "/images/banner1.jpg",
    link: "/products",
  },
  {
    title: "Best Deal Online on smart watches",
    subtitle: undefined,
    imageUrl: "/images/banner2.jpg",
    link: "/products",
  },
  // เพิ่ม slide ตามต้องการ
];

export default function Banner() {
  const [idx, setIdx] = useState(0);
  const { title, subtitle, imageUrl, link } = slides[idx];

  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx((i) => (i + 1) % slides.length);

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl bg-gradient-to-r from-green-400 to-green-700 mb-8">
      {/* ภาพแบ็คกราวนด์ */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      {/* เนื้อหา */}
      <a
        href={link}
        className="relative z-10 flex h-full items-center px-6 md:px-12 text-white"
      >
        <div>
          {subtitle && (
            <p className="uppercase tracking-wider mb-1">{subtitle}</p>
          )}
          <h2 className="text-2xl md:text-4xl font-bold">{title}</h2>
        </div>
      </a>

      {/* ปุ่มควบคุม */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
      >
        <ChevronLeftIcon className="w-6 h-6 text-green-800" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
      >
        <ChevronRightIcon className="w-6 h-6 text-green-800" />
      </button>

      {/* indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <span
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              i === idx ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

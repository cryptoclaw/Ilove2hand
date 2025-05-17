// components/Banner.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const bannerImages = [
  "/images/banner1.png",
  "/images/banner2.png",
  "/images/banner3.jpg",
];

export default function Banner() {
  const [idx, setIdx] = useState(0);
  const total = bannerImages.length;

  // เลื่อนอัตโนมัติทุก 5 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
      {/* รูปปัจจุบัน */}
      <Image
        src={bannerImages[idx]}
        alt={`Banner ${idx + 1}`}
        fill
        className="object-cover"
      />

      {/* Prev button */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
      >
        ◀
      </button>

      {/* Next button */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
      >
        ▶
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {bannerImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full ${
              i === idx ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

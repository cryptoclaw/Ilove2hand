// next.config.js
const nextTranslate = require("next-translate-plugin");

/** @type {import('next').NextConfig} */
module.exports = nextTranslate({
  reactStrictMode: true,
  swcMinify: true,

  // ✅ อนุญาตโหลดรูปจากโดเมนภายนอก
  images: {
    // วิธีใหม่ที่แนะนำ
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // เพิ่มได้ตามต้องการ:
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // { protocol: "https", hostname: "*.amazonaws.com" },
    ],

    // ถ้าคุณใช้ Next เวอร์ชันเก่ากว่าและ remotePatterns ยังใช้ไม่ได้
    // ให้ใช้ domains แทน (อย่างใดอย่างหนึ่งพอ):
    // domains: ["picsum.photos"],
  },

  // i18n.json ของ next-translate จะถูกอ่านอัตโนมัติจาก root
});

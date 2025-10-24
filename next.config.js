// next.config.js
const nextTranslate = require("next-translate-plugin");

/** @type {import('next').NextConfig} */
const baseConfig = {
  // ปรับตามต้องการ
  reactStrictMode: true,

  // ✅ อนุญาตโหลดรูปจากโดเมนภายนอก
  images: {
    // ใช้รูปแบบใหม่ที่แนะนำ
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // เพิ่มโดเมนจริงที่คุณใช้ “แบบระบุชัดเจน” เท่านั้น
      // ตัวอย่าง:
      // { protocol: "https", hostname: "res.cloudinary.com" },
      // { protocol: "https", hostname: "your-bucket.s3.amazonaws.com" },
    ],
    // หมายเหตุ: ไม่รองรับ wildcard เช่น "*.amazonaws.com"
    // ถ้าต้องใช้หลายโดเมน S3 ให้เพิ่มรายการที่ใช้จริงทีละรายการ
  },

  // ถ้าคุณมี experimental/อื่นๆ ให้ใส่ที่นี่
};

// ✅ เปิดใช้งาน next-translate (จะอ่าน i18n.json อัตโนมัติที่ root)
module.exports = nextTranslate(baseConfig);

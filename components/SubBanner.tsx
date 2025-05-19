// components/SubBanner.tsx
import Link from "next/link";

export default function SubBanner() {
  return (
    <div className="my-8 p-6 bg-green-50 rounded-xl flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-bold">โปรโมชั่นพิเศษ!</h2>
        <p className="mt-2 text-gray-700">
          รับส่วนลดเพิ่ม 10% เมื่อซื้อครบ 2,000 ฿ ขึ้นไป
          วันนี้–สิ้นเดือนนี้เท่านั้น
        </p>
      </div>
      <Link
        href="/promotions"
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        ดูรายละเอียดโปรโมชั่น
      </Link>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";

// Mock data ตัวอย่างสำหรับแสดงผล (คุณเปลี่ยนไปใช้ API จริงได้)
const MOCK_SALES_DATA = {
  totalSales: 54,
  totalCost: 54,
  totalProfit: 54,
  bestSellers: [
    { rank: 1, name: ".............", qty: 15 },
    { rank: 2, name: "", qty: 0 },
    { rank: 3, name: "", qty: 0 },
  ],
  dailySales: 54,
  dailyProfit: 54,
  dailyCost: 54,
};

export default function AdminDashboard() {
  const { user } = useAuth();

  // สมมติปีที่เลือกใน select
  const [year, setYear] = useState<number>(2025);

  // คุณสามารถ fetch ข้อมูลจาก API ที่นี่แทน mock ได้
  // useEffect(() => { ... fetch data ... }, [year]);

  return (
    <Layout title="แดชบอร์ด">
      {/* Header */}
      <h1 className="text-3xl font-semibold mb-8 border-b border-gray-300 pb-4">
        แดชบอร์ด
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "ยอดขายทั้งหมด", value: MOCK_SALES_DATA.totalSales },
          { label: "ค่าใช้จ่ายทั้งหมด", value: MOCK_SALES_DATA.totalCost },
          { label: "กำไรสุทธิทั้งหมด", value: MOCK_SALES_DATA.totalProfit },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center"
          >
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="text-2xl font-bold">{value} บาท</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Best Sellers Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              อันดับสินค้าขายดี
            </h2>
            <table className="w-full text-center border border-gray-300 rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 w-20">อันดับ</th>
                  <th className="border border-gray-300 px-4 py-2">ชื่อสินค้า</th>
                  <th className="border border-gray-300 px-4 py-2 w-40">จำนวนที่ขาย</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SALES_DATA.bestSellers.map(({ rank, name, qty }) => (
                  <tr key={rank}>
                    <td className="border border-gray-300 px-4 py-2">{rank}</td>
                    <td className="border border-gray-300 px-4 py-2">{name || "............."}</td>
                    <td className="border border-gray-300 px-4 py-2">{qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {[
            { label: "ยอดขายแต่ละวัน", value: MOCK_SALES_DATA.dailySales },
            { label: "กำไรแต่ละวัน", value: MOCK_SALES_DATA.dailyProfit },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-lg shadow p-6 text-center"
            >
              <p className="text-lg font-semibold mb-2">{label}</p>
              <p className="text-xl">{value} บาท</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Trend Chart Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">แนวโน้มการเติบโต</h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded p-2"
          >
            {[2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {/* กราฟ placeholder */}
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          {/* คุณสามารถเปลี่ยนเป็นกราฟจริง ๆ โดยใช้ chart library เช่น recharts หรือ chart.js */}
          <p>กราฟยอดขาย & ค่าใช้จ่าย (mock)</p>
        </div>
      </div>
    </Layout>
  );
}

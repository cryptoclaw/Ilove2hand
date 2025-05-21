// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // TODO: รับข้อมูลคำสั่งซื้อจาก req.body
    // ประมวลผล สร้าง order ในฐานข้อมูล
    // ส่ง response กลับ
    res.status(200).json({ message: "Order created successfully", id: "order123" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

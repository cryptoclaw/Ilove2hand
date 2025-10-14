// controllers/authController.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as authService from "@/services/authService";

function setAuthCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  const cookie = [
    `token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 7}`, // 7 วัน
    isProd ? "Secure" : "",
  ].filter(Boolean).join("; ");
  res.setHeader("Set-Cookie", cookie);
}

export async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    return res.status(201).json(user);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

export async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    setAuthCookie(res, token);
    // จะคืน token ด้วยหรือไม่แล้วแต่ต้องการ; ส่วนใหญ่พอแล้วแค่ตั้งคุกกี้
    return res.status(200).json({ user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function adminLoginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    setAuthCookie(res, token);
    return res.status(200).json({ user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}

export async function logoutHandler(_req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProd ? "; Secure" : ""}`
  );
  return res.status(200).json({ success: true });
}

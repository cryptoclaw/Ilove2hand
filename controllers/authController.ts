import type { NextApiRequest, NextApiResponse } from "next";
import * as authService from "@/services/authService";
import { signToken } from "@/lib/auth";

function setAuthCookie(res: NextApiResponse, token: string, remember: boolean) {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `token=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
  ];
  if (remember) parts.push(`Max-Age=${60 * 60 * 24 * 7}`); // 7 วัน
  if (isProd) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { email, password, remember = false } = req.body || {};
    const { user } = await authService.login(email, password); // ให้ service คืน user
    const token = signToken({ id: user.id, role: user.role });
    setAuthCookie(res, token, !!remember);
    // ไม่จำเป็นต้องส่ง token กลับแล้วก็ได้ แต่ส่ง user กลับเพื่อให้ client set state ได้ไว
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

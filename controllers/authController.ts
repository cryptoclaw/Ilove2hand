// controllers/authController.ts
import type { NextApiRequest, NextApiResponse } from "next";
import * as authService from "../services/authService";
import { serialize } from "cookie";

const COOKIE_NAME = "token";

export async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    // จะตั้งคุกกี้ตอนสมัครเลยก็ได้ ถ้าอยาก auto-login:
    // const { token } = await authService.login(email, password);
    // setAuthCookie(res, token, /*remember=*/true);
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
    const { email, password, remember } = req.body as {
      email: string;
      password: string;
      remember?: boolean;
    };

    const { user, token } = await authService.login(email, password);

    // ✅ ตั้งคุกกี้ HttpOnly ให้ AuthContext ดึงโปรไฟล์ได้
    setAuthCookie(res, token, !!remember);

    // จะส่ง user กลับไปด้วยก็ได้ (ไม่จำเป็นต้องส่ง token ต่อแล้ว)
    return res.status(200).json({ user });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }
}

function setAuthCookie(res: NextApiResponse, token: string, remember: boolean) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 4; // 30 วัน / 4 ชม.
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    })
  );
}

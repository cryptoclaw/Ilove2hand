// services/authService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userModel from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function register(name: string, email: string, password: string) {
  // ตรวจสอบว่ามี user นี้ใน DB หรือยัง
  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }
  // สร้าง hash ของรหัสผ่าน
  const hash = await bcrypt.hash(password, 10);
  // สร้าง user ใหม่
  const user = await userModel.createUser({
    name,
    email,
    passwordHash: hash,
  });
  return user;
}

export async function login(email: string, password: string) {
  // หา user ตาม email
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  // ตรวจสอบ password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  // สร้าง JWT
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return { user, token };
}

export function verifyToken(token: string) {
  // ตรวจสอบความถูกต้องของ token
  return jwt.verify(token, JWT_SECRET);
}

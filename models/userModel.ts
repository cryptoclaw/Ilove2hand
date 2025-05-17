// models/userModel.ts

import { prisma as prismaClient } from "../lib/prisma";
import type { User } from "@prisma/client";

/**
 * ค้นหา User ตามอีเมล
 * @param email Email ของผู้ใช้
 * @returns Promise<User | null>
 */
export function findUserByEmail(email: string): Promise<User | null> {
  return prismaClient.user.findUnique({
    where: { email },
  });
}

/**
 * สร้าง User ใหม่
 * @param data ข้อมูลผู้ใช้ { name, email, passwordHash }
 * @returns Promise<User>
 */
export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  return prismaClient.user.create({
    data,
  });
}

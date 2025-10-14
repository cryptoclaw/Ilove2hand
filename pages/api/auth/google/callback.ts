// pages/api/auth/google/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { getGoogleClient } from '@/lib/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    const cookieState = req.cookies.g_state;
    const remember = req.cookies.g_remember === '1';
    const redirect = decodeURIComponent(req.cookies.g_redirect || '/') || '/';

    if (!code || !state || !cookieState || state !== cookieState) {
      return res.status(400).send('Invalid state');
    }

    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: profile } = await oauth2.userinfo.get();

    const email = profile.email?.toLowerCase();
    const name = profile.name || profile.given_name || 'Google User';

    if (!email) return res.status(400).send('Email not found from Google');

    // upsert user ตาม email (schema ไม่มี googleId)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: randomPass,
          role: 'USER',
        },
      });
    } else if (user.name !== name) {
      // อัปเดตชื่อให้ตรงกับ Google (ไม่บังคับ)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // ออก JWT -> คุกกี้ token (ให้ระบบเดิมอ่าน)
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: remember ? '30d' : '1d',
    });

    const cookieBase = `token=${token}; Path=/; HttpOnly; SameSite=Lax`;
    const cookieWithAge = remember ? `${cookieBase}; Max-Age=${30 * 24 * 60 * 60}` : cookieBase;

    // ลบคุกกี้ชั่วคราว + ตั้ง token
    res.setHeader('Set-Cookie', [
      cookieWithAge,
      'g_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      'g_remember=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      'g_redirect=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
    ]);

    // ส่งกลับไปหน้าเดิม (หรือ '/')
    res.writeHead(302, { Location: redirect });
    res.end();
  } catch (e: any) {
    console.error('Google OAuth callback error:', e);
    res.status(500).send('OAuth failed');
  }
}

// pages/api/auth/google/url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getGoogleAuthUrl } from '@/lib/google';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const remember = req.query.remember === '1' ? '1' : '0';
  const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '/';

  const state = crypto.randomBytes(16).toString('hex');

  // เก็บค่าไว้ตรวจตอน callback
  res.setHeader('Set-Cookie', [
    `g_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    `g_remember=${remember}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    `g_redirect=${encodeURIComponent(redirect)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
  ]);

  const url = getGoogleAuthUrl(state);
  // frontend ของคุณ fetch แล้วรอ {url} => ส่งกลับเป็น JSON
  res.status(200).json({ url });
}

// pages/api/auth/google/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleAuthUrl } from '@/lib/google';
import crypto from 'crypto';

function b64url(s: string) {
  return Buffer.from(s).toString('base64url');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const remember = req.query.remember === '1' ? 1 : 0;
  const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '/';
  const csrf = crypto.randomBytes(16).toString('hex');

  const stateObj = { csrf, remember, redirect };
  const state = b64url(JSON.stringify(stateObj));

  // เก็บ state ฝั่งเราเพื่อเทียบตอน callback
  res.setHeader(
    'Set-Cookie',
    `g_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  const url = getGoogleAuthUrl(state);
  res.writeHead(302, { Location: url });
  res.end();
}

// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUserFromReq } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUserFromReq(req);
  if (!user) return res.status(401).json({ user: null });
  const { passwordHash, ...safe } = user as any;
  res.status(200).json({ user: safe });
}

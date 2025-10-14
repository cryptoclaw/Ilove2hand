// pages/api/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { closeAuction, getAuctionById } from '../../../services/auctionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'GET') {
      const auction = await getAuctionById(id);
      if (!auction) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(auction);
    }
    if (req.method === 'PATCH') {
      const updated = await closeAuction(id);
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? 'Bad Request' });
  }
}



// pages/api/admin/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { requireAdminApi } from '@/lib/auth';
import { getAuctionById, closeAuction, adminUpdateAuction, adminDeleteAuction, adminCancelAuction } from '@/services/auctionService';

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.get(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  const { id } = req.query as { id: string };
  const auction = await getAuctionById(id);
  if (!auction) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(auction);
});

handler.patch(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  const { id } = req.query as { id: string };
  const b = req.body || {};

  if (b.action === 'cancel') {
    const a = await adminCancelAuction(id);
    return res.status(200).json(a);
  }
  if (b.action === 'close') {
    const a = await closeAuction(id);
    return res.status(200).json(a);
  }

  const updated = await adminUpdateAuction(id, {
    title: b.title,
    description: b.description ?? undefined,
    bidIncrement: b.bidIncrement ? Number(b.bidIncrement) : undefined,
    startAt: b.startAt ? new Date(b.startAt) : undefined,
    endAt: b.endAt ? new Date(b.endAt) : undefined,
    status: typeof b.status === 'string' ? (b.status.toUpperCase() as any) : undefined,
  });
  res.status(200).json(updated);
});

handler.delete(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  const { id } = req.query as { id: string };
  await adminDeleteAuction(id);
  res.status(204).end();
});

export default handler;

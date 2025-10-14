// pages/api/auctions/[id]/bids.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromReq } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const me = await getSessionUserFromReq(req);
  if (!me) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query as { id: string };
  const amount = Number(req.body?.amount ?? 0);

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!auction) return res.status(404).json({ error: "Auction not found" });

  const min = (auction.bids[0]?.amount ?? auction.currentPrice) + auction.bidIncrement;
  if (!amount || amount < min) return res.status(400).json({ error: `Bid must be >= ${min}` });

  const bid = await prisma.bid.create({
    data: { auctionId: id, userId: me.id, amount },
    include: { bidder: { select: { name: true, email: true } } }, // << เพื่อให้ชื่อกลับไปด้วย
  });

  await prisma.auction.update({ where: { id }, data: { currentPrice: amount } });
  return res.status(201).json(bid);
}

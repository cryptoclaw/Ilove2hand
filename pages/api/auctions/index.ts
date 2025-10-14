// pages/api/auctions/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createAuction, listAuctions } from "@/services/auctionService";
import { getSessionUserFromReq } from "@/lib/auth";
import type { AuctionStatus } from "@prisma/client";

const AUCTION_STATUSES = ["SCHEDULED", "LIVE", "ENDED", "CANCELED"] as const;
type Status = (typeof AUCTION_STATUSES)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const me = await getSessionUserFromReq(req);
      if (!me) return res.status(401).json({ error: "Unauthorized" });

      const dto = {
        productId: String(req.body.productId),
        sellerId: me.id, // ใช้ผู้ใช้จริงจากคุกกี้/โทเคน
        title: String(req.body.title),
        description: req.body.description ? String(req.body.description) : undefined,
        startPrice: Number(req.body.startPrice),
        bidIncrement: req.body.bidIncrement ? Number(req.body.bidIncrement) : undefined,
        startAt: new Date(req.body.startAt),
        endAt: new Date(req.body.endAt),
      };
      const created = await createAuction(dto);
      return res.status(201).json(created);
    }

    if (req.method === "GET") {
      const q = typeof req.query.q === "string" ? req.query.q : undefined;

      let status: Status | undefined;
      if (typeof req.query.status === "string") {
        const s = req.query.status.toUpperCase();
        if ((AUCTION_STATUSES as readonly string[]).includes(s)) status = s as Status;
      }

      const data = await listAuctions({ q, status: status as AuctionStatus | undefined });
      return res.status(200).json(data);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("[/api/auctions] error:", err);
    return res.status(400).json({ error: err?.message ?? "Bad Request" });
  }
}

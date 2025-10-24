// pages/api/admin/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { requireAdminApi } from "@/lib/auth";
import {
  getAuctionById,
  closeAuction,
  adminUpdateAuction,
  adminDeleteAuction,
  adminCancelAuction,
} from "@/services/auctionService";

const handler = nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, _req, res) {
    console.error("API /admin/auctions/[id] error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: "Method not allowed" });
  },
});

handler.get(async (req, res) => {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  const { id } = req.query as { id: string };

  const auction = await getAuctionById(id);
  if (!auction) return res.status(404).json({ error: "Not found" });
  res.status(200).json(auction);
});

// ...

handler.use(
  async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (err?: any) => void
  ) => {
    if (req.method !== "PATCH") return next();

    const admin = await requireAdminApi(req, res);
    if (!admin) return;

    const { id } = req.query as { id: string };
    const b = (req.body || {}) as {
      action?: "cancel" | "close" | string;
      title?: string;
      description?: string | null;
      bidIncrement?: number | string;
      startAt?: string;
      endAt?: string;
      status?: string;
    };

    if (b.action === "cancel") {
      const a = await adminCancelAuction(id);
      return res.status(200).json(a);
    }
    if (b.action === "close") {
      const a = await closeAuction(id);
      return res.status(200).json(a);
    }

    const updated = await adminUpdateAuction(id, {
      title: b.title,
      description: b.description ?? undefined,
      bidIncrement:
        b.bidIncrement !== undefined ? Number(b.bidIncrement) : undefined,
      startAt: b.startAt ? new Date(b.startAt) : undefined,
      endAt: b.endAt ? new Date(b.endAt) : undefined,
      status:
        typeof b.status === "string"
          ? (b.status.toUpperCase() as any)
          : undefined,
    });

    return res.status(200).json(updated);
  }
);

// 🔁 ใช้ .use() แทน .delete()
handler.use(
  async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (err?: any) => void
  ) => {
    if (req.method !== "DELETE") return next();

    const admin = await requireAdminApi(req, res);
    if (!admin) return;

    const { id } = req.query as { id: string };
    await adminDeleteAuction(id);
    return res.status(204).end();
  }
);

export default handler;

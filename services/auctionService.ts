// services/auctionService.ts
import { prisma } from "@/lib/prisma";
import type { AuctionStatus } from "@prisma/client";

export type CreateAuctionInput = {
  productId: string;
  sellerId: string;
  title: string;
  description?: string;
  startPrice: number;
  bidIncrement?: number;
  startAt: Date;
  endAt: Date;
};

export async function createAuction(input: CreateAuctionInput) {
  const created = await prisma.auction.create({
    data: {
      productId: input.productId,
      sellerId: input.sellerId,
      title: input.title,
      description: input.description ?? null,
      startPrice: input.startPrice,
      currentPrice: input.startPrice,
      bidIncrement: input.bidIncrement ?? 10,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "SCHEDULED",
    },
  });
  return getAuctionById(created.id);
}

export async function listAuctions(params?: { status?: AuctionStatus; q?: string }) {
  const { status, q } = params ?? {};
  return prisma.auction.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { endAt: "asc" }],
    include: {
      product: true,
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        include: { bidder: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function getAuctionById(id: string) {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      product: true,
      seller: { select: { id: true, name: true, email: true } },
      bids: {
        orderBy: { amount: "desc" },
        include: { bidder: { select: { id: true, name: true, email: true } } },
      },
      winnerBid: {
        include: { bidder: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

export async function closeAuction(id: string) {
  const a = await prisma.auction.findUnique({
    where: { id },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!a) throw new Error("Auction not found");

  const top = a.bids[0] ?? null;

  await prisma.auction.update({
    where: { id },
    data: {
      status: "ENDED",
      currentPrice: top ? top.amount : a.currentPrice,
      winnerBidId: top ? top.id : null,
    },
  });

  return getAuctionById(id);
}

/* ------------------------- Admin utilities ------------------------- */

type AdminUpdatePatch = {
  title?: string;
  description?: string;
  bidIncrement?: number;
  startAt?: Date;
  endAt?: Date;
  status?: AuctionStatus;
};

export async function adminUpdateAuction(id: string, patch: AdminUpdatePatch) {
  const data: any = {};
  if (typeof patch.title === "string") data.title = patch.title;
  if (typeof patch.description !== "undefined") data.description = patch.description ?? null;
  if (typeof patch.bidIncrement === "number") data.bidIncrement = patch.bidIncrement;
  if (patch.startAt instanceof Date) data.startAt = patch.startAt;
  if (patch.endAt instanceof Date) data.endAt = patch.endAt;
  if (patch.status) data.status = patch.status;

  if (data.startAt && data.endAt && data.endAt <= data.startAt) {
    throw new Error("End time must be after start time");
  }

  await prisma.auction.update({ where: { id }, data });
  return getAuctionById(id);
}

export async function adminCancelAuction(id: string) {
  await prisma.auction.update({
    where: { id },
    data: { status: "CANCELED", winnerBidId: null },
  });
  return getAuctionById(id);
}

export async function adminDeleteAuction(id: string) {
  // ลบบิดทั้งหมดก่อนเพื่อให้ลบ Auction ได้สะอาด
  await prisma.bid.deleteMany({ where: { auctionId: id } });
  await prisma.auction.delete({ where: { id } });
  return true;
}

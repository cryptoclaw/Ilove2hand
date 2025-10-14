// types/auction.ts
import { AuctionStatus } from '@prisma/client';

export type AuctionListItem = {
  id: string;
  title: string;
  currentPrice: number;
  endAt: string;
  status: AuctionStatus;
  product: { id: string; imageUrl?: string | null; price: number };
  bids: { id: string; amount: number }[];
};

export type AuctionDetail = {
  id: string;
  title: string;
  description?: string | null;
  startPrice: number;
  currentPrice: number;
  bidIncrement: number;
  endAt: string;
  status: AuctionStatus;
  product: { id: string; imageUrl?: string | null; price: number };
  bids: { id: string; amount: number; createdAt: string }[];
};

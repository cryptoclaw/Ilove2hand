// prisma/seed.ts
import { prisma } from '../lib/prisma';
import { addMinutes, addDays } from 'date-fns';

async function main() {
  // user ตัวอย่าง
  const user = await prisma.user.upsert({
    where: { email: 'demo@auction.local' },
    update: {},
    create: {
      email: 'demo@auction.local',
      name: 'Demo Seller',
      passwordHash: 'x', // ใส่เดโค้ดเฉยๆ
    },
  });

  // bidder เดโม
  const bidder = await prisma.user.upsert({
    where: { email: 'bidder@auction.local' },
    update: {},
    create: {
      email: 'bidder@auction.local',
      name: 'Demo Bidder',
      passwordHash: 'x',
    },
  });

  // product ตัวอย่าง
  const product = await prisma.product.create({
    data: {
      price: 1990,
      stock: 1,
      imageUrl: 'https://picsum.photos/800/500',
      translations: {
        create: [
          { locale: 'en', name: 'Used Sneakers', description: 'Good condition' },
          { locale: 'th', name: 'รองเท้ามือสอง', description: 'สภาพดี' },
        ],
      },
    },
  });

  // auction ตัวอย่าง
  const now = new Date();
  const auction = await prisma.auction.create({
    data: {
      productId: product.id,
      sellerId: user.id,
      title: 'รองเท้ามือสอง รุ่นฮิต',
      description: 'เริ่มถูก ๆ ใส่นิ่ม',
      startPrice: 500,
      currentPrice: 500,
      bidIncrement: 50,
      startAt: addMinutes(now, -10),
      endAt: addDays(now, 3),
    },
  });

  // bid เริ่มต้น (ใส่ก็ได้ไม่ใส่ก็ได้)
  await prisma.bid.create({
    data: {
      auctionId: auction.id,
      userId: bidder.id,
      amount: 550,
    },
  });

  console.log('Seed done:', { seller: user.email, bidder: bidder.email, product: product.id, auction: auction.id });
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });

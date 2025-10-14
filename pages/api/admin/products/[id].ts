// pages/api/admin/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;
  const { id } = req.query as { id: string };

  if (req.method === 'PATCH') {
    const b = req.body || {};
    const data: any = {};

    if (typeof b.imageUrl === 'string') data.imageUrl = b.imageUrl;

    // OPTIONAL: อัปเดตชื่อ/คำอธิบาย (ทั้ง th/en) ถ้าส่งมา
    if (typeof b.name === 'string' || typeof b.description === 'string') {
      const name = typeof b.name === 'string' ? b.name : undefined;
      const description = typeof b.description === 'string' ? b.description : undefined;

      await prisma.product.update({
        where: { id },
        data: {
          ...(Object.keys(data).length ? data : {}),
          translations: name || description ? {
            upsert: [
              {
                where: { productId_locale: { productId: id, locale: 'en' } },
                update: { ...(name ? { name } : {}), ...(description ? { description } : {}) },
                create: { locale: 'en', name: name ?? 'Unnamed', description: description ?? null },
              },
              {
                where: { productId_locale: { productId: id, locale: 'th' } },
                update: { ...(name ? { name } : {}), ...(description ? { description } : {}) },
                create: { locale: 'th', name: name ?? 'ไม่มีชื่อ', description: description ?? null },
              },
            ],
          } : undefined,
        },
      });
    } else if (Object.keys(data).length) {
      await prisma.product.update({ where: { id }, data });
    } else {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await prisma.product.findUnique({ where: { id } });
    return res.status(200).json(updated);
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).end('Method Not Allowed');
}

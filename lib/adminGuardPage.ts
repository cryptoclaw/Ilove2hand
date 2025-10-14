// lib/adminGuardPage.ts
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { adminGuard } from '@/lib/adminGuard';

export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
  return adminGuard(ctx, async () => ({ props: {} }));
}

import { redirect } from 'next/navigation';
import { counterPackageParamsSchema } from '@konter/shared';
import { counterPackagesPath } from '@/features/admin/packages/paths';

export default async function LegacyNewPackagePage({ searchParams }) {
  const { counterId } = await searchParams;
  const parsed = counterPackageParamsSchema.safeParse({ counterId });
  redirect(parsed.success ? `${counterPackagesPath(parsed.data.counterId)}/baru` : '/admin/konter');
}

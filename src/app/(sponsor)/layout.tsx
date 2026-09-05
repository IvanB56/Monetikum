import { ReactNode } from 'react';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { prefetchUser } from '@entities/user';
import { getQueryClient } from '@shared/lib/query';

// Дублирует (student)/layout.tsx — временно, до появления третьего потребителя prefetchUser (см. ревью Фазы 1.3)
export default async function SponsorLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  await prefetchUser(queryClient);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}

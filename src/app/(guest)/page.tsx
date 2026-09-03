import {Button, Title} from '@mantine/core';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';

import {Header} from '@widgets/Header';
import {prefetchRegions} from '@entities/regions';
import {getQueryClient} from '@shared/lib/query';

export default async function Page() {
  const queryClient = getQueryClient();

  await prefetchRegions(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <Header/>
        <Title order={1}>Hello, Next.js!</Title>
        <Button size="sm">
          Кнопка
        </Button>
      </div>
    </HydrationBoundary>
  )
}

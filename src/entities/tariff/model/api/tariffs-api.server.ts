import {type QueryClient} from '@tanstack/react-query';

import {serverFetch} from '@shared/api';

import {Tariff, TariffsResponse} from '../types/tariffs';

import {unwrapTariffs} from './tariffs-mapper';
import {TARIFFS_QUERY_KEY} from './tariffs-query-key';

export async function getTariffsServer(): Promise<Tariff[]> {
  const response = await serverFetch<TariffsResponse>('/subscriptions/types');

  return unwrapTariffs(response);
}

export async function prefetchTariffs(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: TARIFFS_QUERY_KEY,
    queryFn: getTariffsServer
  })
}
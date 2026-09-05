import {type QueryClient} from '@tanstack/react-query';

import {serverFetch} from '@shared/api';
import {unwrapData} from '@shared/lib/helpers';

import {Region, RegionsResponse} from '../types/region';

import {REGIONS_QUERY_KEY} from './regions-query-key';

export async function getRegionsServer(): Promise<Region[]> {
  const response = await serverFetch<RegionsResponse>('/regions');

  return unwrapData<Region, RegionsResponse>(response);
}

export async function prefetchRegions(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegionsServer,
  });
}

import {QueryClient} from '@tanstack/react-query';

import {serverFetch} from '@shared/api/server-fetch';

import {Region, RegionsResponse} from '../types/region';

import {unwrapRegions} from './regions-mapper';
import {REGIONS_QUERY_KEY} from './regions-query-key';

export async function getRegionsServer(): Promise<Region[]> {
  const response = await serverFetch<RegionsResponse>('/regions');

  return unwrapRegions(response);
}

export async function prefetchRegions(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegionsServer,
  });
}

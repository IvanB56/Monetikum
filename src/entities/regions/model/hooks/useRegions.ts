'use client';

import {useQuery} from '@tanstack/react-query';

import {getRegions} from '../api/regions-api.client';
import {REGIONS_QUERY_KEY} from '../api/regions-query-key';

export function useRegions() {
  return useQuery({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegions,
    staleTime: 5 * 60 * 1000,
  });
}

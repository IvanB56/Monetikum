'use client';

import {useQuery} from '@tanstack/react-query';

import {getTariffs} from '../api/tariffs-api.client';
import {TARIFFS_QUERY_KEY} from '../api/tariffs-query-key';

export function useTariffs() {
  return useQuery({
    queryKey: TARIFFS_QUERY_KEY,
    queryFn: getTariffs,
    staleTime: 5 * 60 * 1000
  })
}
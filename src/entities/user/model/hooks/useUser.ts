'use client';
import {useQuery} from '@tanstack/react-query';

import {getUser} from '../api/user-api.client';
import {USER_QUERY_KEY} from '../api/user-query-key';

export function useUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: getUser,
    staleTime: 5 * 60 * 1000,
  })
}
import {QueryClient} from '@tanstack/react-query';

import {authenticatedServerFetch} from '@shared/api';

import {User, UserResponse} from '../types/user';

import {USER_QUERY_KEY} from './user-query-key';

export async function getUserServer(): Promise<User> {
  const response = await authenticatedServerFetch<UserResponse>('/user');

  return response.data;
}

export async function prefetchUser(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: getUserServer
  })
}

import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import type { User } from '../types/user';

import { getUserServer, prefetchUser } from './user-api.server';
import { USER_QUERY_KEY } from './user-query-key';

const authenticatedServerFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/api', () => ({
  authenticatedServerFetch: authenticatedServerFetchMock,
}));

const mockUser: User = {
  user_id: '1',
  name: 'Иван',
  surname: 'Иванов',
  patronymic: 'Иванович',
  email: 'ivan@example.com',
  phone: '+70000000000',
  birthdate: '2000-01-01',
  region: { slug: 'msk', name: 'Москва' },
  type: 'Sponsor',
};

describe('getUserServer', () => {
  it('запрашивает /user и возвращает response.data', async () => {
    authenticatedServerFetchMock.mockResolvedValueOnce({ data: mockUser });

    const result = await getUserServer();

    expect(authenticatedServerFetchMock).toHaveBeenCalledWith('/user');
    expect(result).toEqual(mockUser);
  });
});

describe('prefetchUser', () => {
  it('вызывает prefetchQuery с USER_QUERY_KEY и getUserServer в качестве queryFn', async () => {
    const prefetchQuery = vi.fn().mockResolvedValue(undefined);
    const queryClient = { prefetchQuery } as unknown as QueryClient;

    await prefetchUser(queryClient);

    expect(prefetchQuery).toHaveBeenCalledWith({
      queryKey: USER_QUERY_KEY,
      queryFn: getUserServer,
    });
  });
});

import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '@shared/lib/test';

import type { User } from '../types/user';

import { useUser } from './useUser';

const getUserMock = vi.hoisted(() => vi.fn());

vi.mock('../api/user-api.client', () => ({
  getUser: getUserMock,
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

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUser', () => {
  it('возвращает пользователя после успешной загрузки', async () => {
    getUserMock.mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  it('пробрасывает ошибку запроса как isError', async () => {
    getUserMock.mockRejectedValueOnce(new Error('unauthorized'));

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

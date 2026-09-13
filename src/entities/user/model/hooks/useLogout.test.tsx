import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '@shared/lib/test';

import { USER_QUERY_KEY } from '../api/user-query-key';

import { useLogout } from './useLogout';

const logoutSanctumSessionActionMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());

vi.mock('../actions/logout-session', () => ({
  logoutSanctumSessionAction: logoutSanctumSessionActionMock,
}));

vi.mock('next-auth/react', () => ({
  signOut: signOutMock,
}));

function createWrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('вызывает серверный action логаута, затем signOut, и на успехе очищает кэш пользователя', async () => {
    logoutSanctumSessionActionMock.mockResolvedValueOnce(undefined);
    signOutMock.mockResolvedValueOnce(undefined);

    const queryClient = createTestQueryClient();
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(logoutSanctumSessionActionMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
    expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: USER_QUERY_KEY });

    const [actionCallOrder] = logoutSanctumSessionActionMock.mock.invocationCallOrder;
    const [signOutCallOrder] = signOutMock.mock.invocationCallOrder;
    expect(actionCallOrder).toBeLessThan(signOutCallOrder);
  });

  it('не очищает кэш пользователя, если серверный action завершился ошибкой', async () => {
    logoutSanctumSessionActionMock.mockRejectedValueOnce(new Error('logout failed'));

    const queryClient = createTestQueryClient();
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(queryClient) });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(signOutMock).not.toHaveBeenCalled();
    expect(removeQueriesSpy).not.toHaveBeenCalled();
  });
});

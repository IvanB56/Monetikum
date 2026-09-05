import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '@shared/lib/test';

import { useRegions } from './useRegions';

const getRegionsMock = vi.hoisted(() => vi.fn());

vi.mock('../api/regions-api.client', () => ({
  getRegions: getRegionsMock,
}));

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRegions', () => {
  it('возвращает список регионов после успешной загрузки', async () => {
    getRegionsMock.mockResolvedValueOnce([{ slug: 'msk', name: 'Москва' }]);

    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ slug: 'msk', name: 'Москва' }]);
    expect(getRegionsMock).toHaveBeenCalledTimes(1);
  });

  it('пробрасывает ошибку запроса как isError', async () => {
    getRegionsMock.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useRegions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

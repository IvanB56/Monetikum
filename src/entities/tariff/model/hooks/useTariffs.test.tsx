import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '@shared/lib/test';

import { useTariffs } from './useTariffs';

const getTariffsMock = vi.hoisted(() => vi.fn());

vi.mock('../api/tariffs-api.client', () => ({
  getTariffs: getTariffsMock,
}));

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTariffs', () => {
  it('возвращает список тарифов после успешной загрузки', async () => {
    const tariff = { name: 'Базовый', period: 'month', old_price: '100', price: '90', slug: 'basic' };
    getTariffsMock.mockResolvedValueOnce([tariff]);

    const { result } = renderHook(() => useTariffs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([tariff]);
    expect(getTariffsMock).toHaveBeenCalledTimes(1);
  });

  it('пробрасывает ошибку запроса как isError', async () => {
    getTariffsMock.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useTariffs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

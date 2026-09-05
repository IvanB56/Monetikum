import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { getTariffsServer, prefetchTariffs } from './tariffs-api.server';
import { TARIFFS_QUERY_KEY } from './tariffs-query-key';

const serverFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/api', () => ({
  serverFetch: serverFetchMock,
}));

describe('getTariffsServer', () => {
  it('запрашивает /subscriptions/types и разворачивает data в массив', async () => {
    const tariff = { name: 'Базовый', period: 'month', old_price: '100', price: '90', slug: 'basic' };
    serverFetchMock.mockResolvedValueOnce({ data: [tariff] });

    const result = await getTariffsServer();

    expect(serverFetchMock).toHaveBeenCalledWith('/subscriptions/types');
    expect(result).toEqual([tariff]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    serverFetchMock.mockResolvedValueOnce({});

    const result = await getTariffsServer();

    expect(result).toEqual([]);
  });
});

describe('prefetchTariffs', () => {
  it('вызывает prefetchQuery с TARIFFS_QUERY_KEY и getTariffsServer в качестве queryFn', async () => {
    const prefetchQuery = vi.fn().mockResolvedValue(undefined);
    const queryClient = { prefetchQuery } as unknown as QueryClient;

    await prefetchTariffs(queryClient);

    expect(prefetchQuery).toHaveBeenCalledWith({
      queryKey: TARIFFS_QUERY_KEY,
      queryFn: getTariffsServer,
    });
  });
});

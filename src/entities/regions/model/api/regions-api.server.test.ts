import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { getRegionsServer, prefetchRegions } from './regions-api.server';
import { REGIONS_QUERY_KEY } from './regions-query-key';

const serverFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/api', () => ({
  serverFetch: serverFetchMock,
}));

describe('getRegionsServer', () => {
  it('запрашивает /regions и разворачивает data в массив', async () => {
    serverFetchMock.mockResolvedValueOnce({ data: [{ slug: 'msk', name: 'Москва' }] });

    const result = await getRegionsServer();

    expect(serverFetchMock).toHaveBeenCalledWith('/regions');
    expect(result).toEqual([{ slug: 'msk', name: 'Москва' }]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    serverFetchMock.mockResolvedValueOnce({});

    const result = await getRegionsServer();

    expect(result).toEqual([]);
  });
});

describe('prefetchRegions', () => {
  it('вызывает prefetchQuery с REGIONS_QUERY_KEY и getRegionsServer в качестве queryFn', async () => {
    const prefetchQuery = vi.fn().mockResolvedValue(undefined);
    const queryClient = { prefetchQuery } as unknown as QueryClient;

    await prefetchRegions(queryClient);

    expect(prefetchQuery).toHaveBeenCalledWith({
      queryKey: REGIONS_QUERY_KEY,
      queryFn: getRegionsServer,
    });
  });
});

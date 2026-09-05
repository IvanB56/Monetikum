import { describe, expect, it, vi } from 'vitest';

import { getRegions } from './regions-api.client';

const getMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/lib/api', () => ({
  $api: { get: getMock },
}));

describe('getRegions', () => {
  it('запрашивает /regions и разворачивает data в массив', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [{ slug: 'msk', name: 'Москва' }] } });

    const result = await getRegions();

    expect(getMock).toHaveBeenCalledWith('/regions');
    expect(result).toEqual([{ slug: 'msk', name: 'Москва' }]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    getMock.mockResolvedValueOnce({ data: {} });

    const result = await getRegions();

    expect(result).toEqual([]);
  });
});

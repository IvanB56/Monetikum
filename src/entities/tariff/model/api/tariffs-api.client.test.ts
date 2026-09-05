import { describe, expect, it, vi } from 'vitest';

import { getTariffs } from './tariffs-api.client';

const getMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/lib/api', () => ({
  $api: { get: getMock },
}));

describe('getTariffs', () => {
  it('запрашивает /subscriptions/types и разворачивает data в массив', async () => {
    const tariff = { name: 'Базовый', period: 'month', old_price: '100', price: '90', slug: 'basic' };
    getMock.mockResolvedValueOnce({ data: { data: [tariff] } });

    const result = await getTariffs();

    expect(getMock).toHaveBeenCalledWith('/subscriptions/types');
    expect(result).toEqual([tariff]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    getMock.mockResolvedValueOnce({ data: {} });

    const result = await getTariffs();

    expect(result).toEqual([]);
  });
});

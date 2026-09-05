import { describe, expect, it, vi } from 'vitest';

import type { User } from '../types/user';

import { getUser } from './user-api.client';

const getMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/lib/api', () => ({
  $authApi: { get: getMock },
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

describe('getUser', () => {
  it('запрашивает /user и возвращает data.data', async () => {
    getMock.mockResolvedValueOnce({ data: { data: mockUser } });

    const result = await getUser();

    expect(getMock).toHaveBeenCalledWith('/user');
    expect(result).toEqual(mockUser);
  });
});

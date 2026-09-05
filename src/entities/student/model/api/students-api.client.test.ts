import { describe, expect, it, vi } from 'vitest';

import type { Student } from '../types/student';

import { getStudents } from './students-api.client';

const getMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/lib/api', () => ({
  $authApi: { get: getMock },
}));

const mockStudent: Student = {
  user_id: 1,
  name: 'Пётр',
  login: 'petya',
  surname: 'Петров',
  patronymic: null,
  birthdate: null,
  avatar: null,
  gender: null,
  budget: null,
};

describe('getStudents', () => {
  it('запрашивает /students и разворачивает data в массив', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [mockStudent] } });

    const result = await getStudents();

    expect(getMock).toHaveBeenCalledWith('/students');
    expect(result).toEqual([mockStudent]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    getMock.mockResolvedValueOnce({ data: {} });

    const result = await getStudents();

    expect(result).toEqual([]);
  });
});

import type { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import type { Student } from '../types/student';

import { getStudentsServer, prefetchStudents } from './students-api.server';
import { STUDENTS_QUERY_KEY } from './students-query-key';

const authenticatedServerFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/api', () => ({
  authenticatedServerFetch: authenticatedServerFetchMock,
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

describe('getStudentsServer', () => {
  it('запрашивает /students и разворачивает data в массив', async () => {
    authenticatedServerFetchMock.mockResolvedValueOnce({ data: [mockStudent] });

    const result = await getStudentsServer();

    expect(authenticatedServerFetchMock).toHaveBeenCalledWith('/students');
    expect(result).toEqual([mockStudent]);
  });

  it('возвращает пустой массив, если data в ответе отсутствует', async () => {
    authenticatedServerFetchMock.mockResolvedValueOnce({});

    const result = await getStudentsServer();

    expect(result).toEqual([]);
  });
});

describe('prefetchStudents', () => {
  it('вызывает prefetchQuery с STUDENTS_QUERY_KEY и getStudentsServer в качестве queryFn', async () => {
    const prefetchQuery = vi.fn().mockResolvedValue(undefined);
    const queryClient = { prefetchQuery } as unknown as QueryClient;

    await prefetchStudents(queryClient);

    expect(prefetchQuery).toHaveBeenCalledWith({
      queryKey: STUDENTS_QUERY_KEY,
      queryFn: getStudentsServer,
    });
  });
});

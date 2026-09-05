import type { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '@shared/lib/test';

import type { Student } from '../types/student';

import { useStudents } from './useStudents';

const getStudentsMock = vi.hoisted(() => vi.fn());

vi.mock('../api/students-api.client', () => ({
  getStudents: getStudentsMock,
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

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useStudents', () => {
  it('возвращает список студентов после успешной загрузки', async () => {
    getStudentsMock.mockResolvedValueOnce([mockStudent]);

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockStudent]);
    expect(getStudentsMock).toHaveBeenCalledTimes(1);
  });

  it('пробрасывает ошибку запроса как isError', async () => {
    getStudentsMock.mockRejectedValueOnce(new Error('unauthorized'));

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

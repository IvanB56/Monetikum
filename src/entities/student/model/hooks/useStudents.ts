'use client';

import {useQuery} from '@tanstack/react-query';

import {getStudents} from '../api/students-api.client';
import {STUDENTS_QUERY_KEY} from '../api/students-query-key';

export function useStudents() {
  return useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: getStudents,
    staleTime: 5 * 60 * 1000,
  });
}

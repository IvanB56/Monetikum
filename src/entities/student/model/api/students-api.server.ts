import {type QueryClient} from '@tanstack/react-query';

import {authenticatedServerFetch} from '@shared/api';
import {unwrapData} from '@shared/lib/helpers';

import {Student, StudentsResponse} from '../types/student';

import {STUDENTS_QUERY_KEY} from './students-query-key';

export async function getStudentsServer(): Promise<Student[]> {
  const response = await authenticatedServerFetch<StudentsResponse>('/students');

  return unwrapData<Student, StudentsResponse>(response);
}

export async function prefetchStudents(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: getStudentsServer,
  });
}

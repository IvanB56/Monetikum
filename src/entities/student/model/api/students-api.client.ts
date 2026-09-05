import {$authApi} from '@shared/lib/api';
import {unwrapData} from '@shared/lib/helpers';

import {Student, StudentsResponse} from '../types/student';

export async function getStudents(): Promise<Student[]> {
  const {data} = await $authApi.get<StudentsResponse>('/students');

  return unwrapData<Student, StudentsResponse>(data);
}

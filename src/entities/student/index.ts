export { getStudents } from './model/api/students-api.client';
export { getStudentsServer, prefetchStudents } from './model/api/students-api.server';
export { STUDENTS_QUERY_KEY } from './model/api/students-query-key';
export { useStudents } from './model/hooks/useStudents';
export type { Student, StudentAvatar, StudentsResponse } from './model/types/student';

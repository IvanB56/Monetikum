export function unwrapData<T, R extends { data: T[] }>(response: R): T[] {
  return response?.data || [];
}
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.API_URL;

/**
 * Обёртка над fetch для server-side запросов (Server Components/Server Actions)
 * к новому NestJS-бэкенду. Бэкенд ещё не заскаффолжен (см. ../../../backend) —
 * конкретные пути/DTO появятся вместе с фичами, которые их вызывают.
 */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`Запрос ${path} завершился с ошибкой ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

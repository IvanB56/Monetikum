import {frontendOriginHeaders, resolveSanctumSessionFromHeaders} from './sanctum-session';
import {ApiError, serverFetch} from './server-fetch';

export async function authenticatedServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const sanctumSession = await resolveSanctumSessionFromHeaders();

  if (!sanctumSession) {
    throw new ApiError('Пользователь не авторизован', 401);
  }

  return serverFetch<T>(path, {
    ...init,
    headers: {
      'X-XSRF-TOKEN': sanctumSession.xsrfToken,
      Cookie: sanctumSession.cookieHeader,
      ...frontendOriginHeaders(),
      ...init?.headers,
    },
  });
}

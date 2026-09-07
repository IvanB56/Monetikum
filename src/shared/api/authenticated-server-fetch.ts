import {frontendOriginHeaders, resolveSanctumSession} from './sanctum-session';
import {ApiError, serverFetch} from './server-fetch';

export async function authenticatedServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const {headers} = await import('next/headers');
  const requestHeaders = await headers();
  const sanctumSession = await resolveSanctumSession({headers: requestHeaders});

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

import {headers} from 'next/headers';

import {resolveSanctumSession} from './sanctum-session';
import {ApiError, serverFetch} from './server-fetch';

export async function authenticatedServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
      ...init?.headers,
    },
  });
}

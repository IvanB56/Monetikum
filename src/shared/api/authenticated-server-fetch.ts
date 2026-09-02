import { headers } from 'next/headers';

import { resolveSanctumSession } from './sanctum-session';
import { ApiError, serverFetch } from './server-fetch';

/**
 * Обёртка над `serverFetch` для авторизованных запросов из Server Component/
 * Server Action — переиспользует его fetch/error-логику как есть, добавляя
 * заголовки `Cookie`/`X-XSRF-TOKEN` Sanctum-сессии текущего пользователя
 * (`resolveSanctumSession`, достаёт их из next-auth JWT напрямую, минуя
 * `session()`-колбэк — см. её doc-комментарий в `sanctum-session.ts`).
 *
 * Бросает `ApiError` со статусом 401, если next-auth сессии нет — вызывающий
 * код (layout/page под `(sponsor)`/`(child)`) сам решает, как на это
 * реагировать (redirect и т.п.).
 */
export async function authenticatedServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const requestHeaders = await headers();
  const sanctumSession = await resolveSanctumSession({ headers: requestHeaders });

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

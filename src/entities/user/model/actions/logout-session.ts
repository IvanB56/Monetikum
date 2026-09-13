'use server';

import { logoutSanctumSession, resolveSanctumSessionFromHeaders, SanctumSessionError } from '@shared/api';

/**
 * Инвалидирует Sanctum session-cookie на backend перед тем, как клиент очистит
 * собственную next-auth JWT-сессию через `signOut()` (см. `useLogout`).
 * Отдельный Server Action, а не клиентский запрос через `$authApi`, — cookie и
 * XSRF-токен достаются из next-auth JWT тем же `resolveSanctumSession`, что
 * использует `authenticatedServerFetch`/авторизованный прокси, и не должны
 * попадать в браузер даже транзитом через ответ API.
 *
 * `SanctumSessionError` (backend уже разлогинил/сессия истекла) намеренно не
 * пробрасывается — логаут идемпотентен: цель — выйти из системы, а не
 * подтвердить, что backend-сессия ещё была жива.
 */
export async function logoutSanctumSessionAction(): Promise<void> {
  const sanctumSession = await resolveSanctumSessionFromHeaders();

  if (!sanctumSession) return;

  try {
    await logoutSanctumSession(sanctumSession);
  } catch (error) {
    if (!(error instanceof SanctumSessionError)) throw error;
  }
}

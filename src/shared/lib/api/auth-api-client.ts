import { createApiClient } from './create-api-client';

/**
 * Клиент для авторизованных браузерных запросов — baseURL указывает на
 * собственный Route Handler-прокси `src/app/api/backend/[...path]/route.ts`
 * (same-origin путь, не сам backend напрямую). Next.js-сервер сам подставляет
 * Sanctum cookie/X-XSRF-TOKEN на лету из next-auth JWT текущего пользователя —
 * браузер эти заголовки/cookie test.monetikum.ru никогда не видит, поэтому
 * `withCredentials` не нужен: next-auth-сессия того же origin отправляется
 * автоматически.
 *
 * Только для клиентского кода. Для авторизованных запросов из Server
 * Component/Server Action — `authenticatedServerFetch` (`@shared/api`).
 */
export const $authApi = createApiClient('/api/backend');

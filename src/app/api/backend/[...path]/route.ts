import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getBackendApiUrl, resolveSanctumSession } from '@shared/api';

/**
 * Авторизованный прокси-слой к тестовому инстансу старого backend
 * (`test.monetikum.ru`, см. корневой CLAUDE.md → "Current integration note" и
 * `@shared/api/sanctum-session`).
 *
 * Отдельная сущность от `rewrites()`-прокси в `next.config.ts`
 * (`/api/proxy/:path*`, публичный, без cookie, не трогается): этот Route
 * Handler читает next-auth JWT текущего пользователя, подставляет Sanctum
 * `Cookie`/`X-XSRF-TOKEN` на лету и НИКОГДА не форвардит `Set-Cookie`
 * backend'а обратно в браузер — session-cookie test.monetikum.ru не должна
 * покидать сервер.
 */

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

type RouteContext = { params: Promise<{ path: string[] }> };

/** Запрещает выход за пределы `${API_URL}/` через `.`/`..` сегменты пути. */
function isSafePathSegment(segment: string): boolean {
  return segment !== '' && segment !== '.' && segment !== '..';
}

async function proxyToBackend(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  // Резолв сессии и чтение тела запроса не зависят друг от друга — запускаем параллельно.
  const sanctumSessionPromise = resolveSanctumSession(request);
  // ArrayBuffer, а не text(): тело форвардится как есть, без UTF-8-декодирования,
  // которое портило бы бинарные/multipart payload'ы (например, будущую загрузку файлов).
  const requestBodyPromise = METHODS_WITHOUT_BODY.has(request.method)
    ? Promise.resolve(undefined)
    : request.arrayBuffer();

  const { path } = await params;
  if (!path.every(isSafePathSegment)) {
    return NextResponse.json({ message: 'Некорректный путь' }, { status: 400 });
  }

  const sanctumSession = await sanctumSessionPromise;
  if (!sanctumSession) {
    return NextResponse.json({ message: 'Пользователь не авторизован' }, { status: 401 });
  }

  const targetUrl = `${getBackendApiUrl()}/${path.join('/')}${request.nextUrl.search}`;

  // Content-Type форвардится от клиента как есть (не захардкожен на 'application/json') —
  // иначе multipart/form-data и другие не-JSON запросы дошли бы до backend с неверным заголовком.
  const proxyHeaders: Record<string, string> = {
    Accept: 'application/json',
    'X-XSRF-TOKEN': sanctumSession.xsrfToken,
    Cookie: sanctumSession.cookieHeader,
  };
  const requestContentType = request.headers.get('content-type');
  if (requestContentType) {
    proxyHeaders['Content-Type'] = requestContentType;
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: await requestBodyPromise,
    });
  } catch {
    return NextResponse.json({ message: 'Backend недоступен' }, { status: 502 });
  }

  const responseBody = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get('content-type');
  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }
  // `Set-Cookie` backend'а намеренно не копируется в ответ — см. doc-комментарий выше.

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;

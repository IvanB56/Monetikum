/**
 * Мост к Sanctum stateful session-cookie авторизации старого backend
 * (`test.monetikum.ru`, см. корневой CLAUDE.md → "Current integration note").
 *
 * Только для серверного использования (next-auth `authorize()`, будущие Server
 * Actions/Route Handlers). Session-cookie и XSRF-токен, которые возвращают эти
 * функции, никогда не должны попадать в браузер напрямую — они кладутся в
 * зашифрованную next-auth JWT (см. `src/shared/config/auth.ts`) и используются
 * только серверным кодом.
 *
 * Реальный контракт backend (Laravel Sanctum, проверено чтением
 * monetikum-backend и живыми запросами к test.monetikum.ru):
 * - `GET /sanctum/csrf-cookie` (вне `/api`) отдаёт `Set-Cookie: XSRF-TOKEN=...`
 *   и cookie сессии — оба обязательны для последующего login/logout.
 * - `POST /api/user/sponsor/login` ({phone, password}) и
 *   `POST /api/user/student/login` ({login, password}) на успехе возвращают
 *   пустой `204` и ротируют cookie сессии (`session()->regenerate()`).
 * - `POST /api/user/logout` инвалидирует сессию.
 *
 * Имя cookie сессии зависит от `APP_NAME` backend (`Str::slug(APP_NAME)_session`)
 * и не хардкодится здесь — вместо разбора конкретных имён захватывается весь
 * cookie jar из `Set-Cookie` и переигрывается как есть.
 */

import type { GetTokenParams } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';

import {
  SPONSOR_REGISTER_FAILED_ERROR,
  SPONSOR_VERIFY_PHONE_FAILED_ERROR,
} from '@shared/constants';

import { translateBackendErrorText } from './backend-error-translations';

export class SanctumSessionError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'SanctumSessionError';
  }
}

/**
 * Ошибка `POST /user/sponsor/verify-phone`/`POST /user/sponsor/register` —
 * в отличие от логина, backend на этих эндпоинтах возвращает структурированные
 * ошибки валидации (`{ message, errors: { field: string[] } }` при 422) или
 * `{ error }` (например, `CannotSendVerifyCodeException` при недоступности
 * SMS-провайдера) — вызывающий код мапит `fieldErrors` на конкретные поля формы.
 */
export class SanctumRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'SanctumRequestError';
  }
}

export interface SanctumSession {
  /** Готовый заголовок `Cookie` (cookie сессии + XSRF-TOKEN) для повторных запросов к backend. */
  cookieHeader: string;
  /** Декодированное значение XSRF-TOKEN для заголовка `X-XSRF-TOKEN`. */
  xsrfToken: string;
}

export interface SponsorLoginCredentials {
  phone: string;
  password: string;
}

export interface StudentLoginCredentials {
  login: string;
  password: string;
}

/** Тело `POST /user/sponsor/verify-phone` — предвалидирует всю форму регистрации и отправляет SMS-код. */
export interface SponsorVerifyPhoneCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}

/** Тело `POST /user/sponsor/register` — те же данные + код, полученный по SMS. */
export interface SponsorRegisterCredentials extends SponsorVerifyPhoneCredentials {
  phoneVerifyCode: string;
  /** Идентификатор партнёра из `?r=<token>` (см. `shared/lib/referral-token`) — не участвует в verify-phone. */
  referralToken?: string;
}

type CookieJar = Record<string, string>;

/** Базовый URL backend API (`https://test.monetikum.ru/api`) — переиспользуется также авторизованным Route Handler-прокси. */
export function getBackendApiUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new SanctumSessionError('Переменная окружения API_URL не задана');
  }
  return apiUrl;
}

/** `https://test.monetikum.ru/api` → `https://test.monetikum.ru` — `/sanctum/*` живёт вне `/api`. */
export function getBackendOrigin(): string {
  return getBackendApiUrl().replace(/\/api\/?$/, '');
}

function parseSetCookiePairs(headers: Headers): CookieJar {
  const jar: CookieJar = {};

  for (const cookie of headers.getSetCookie()) {
    const [pair] = cookie.split(';');
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex === -1) continue;

    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    if (name) jar[name] = value;
  }

  return jar;
}

/** Накатывает новые `Set-Cookie` поверх текущего jar — так учитывается ротация сессии при login (`regenerate()`). */
function mergeCookieJar(base: CookieJar, headers: Headers): CookieJar {
  return { ...base, ...parseSetCookiePairs(headers) };
}

function serializeCookieJar(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function toSanctumSession(jar: CookieJar): SanctumSession {
  const rawXsrfToken = jar['XSRF-TOKEN'];
  if (!rawXsrfToken) {
    throw new SanctumSessionError('Backend не вернул XSRF-TOKEN');
  }

  return {
    cookieHeader: serializeCookieJar(jar),
    xsrfToken: decodeURIComponent(rawXsrfToken),
  };
}

/**
 * `Origin`/`Referer`, которые в браузере подставляются автоматически, здесь
 * приходится подделывать вручную: это server-to-server запрос без Origin по
 * умолчанию, а Laravel Sanctum (`EnsureFrontendRequestsAreStateful::fromFrontend()`)
 * решает, поднимать ли сессию (`StartSession`) для запроса, именно по этим
 * заголовкам, сверяя домен с `SANCTUM_STATEFUL_DOMAINS`. Без них backend не
 * запускает сессию вовсе, и `$request->session()` в `SponsorController::login()`
 * падает с 500 на самом успешном логине (проверено эмпирически на
 * test.monetikum.ru) — ошибка выглядит как "неверные данные", хотя причина
 * совсем другая. Собственный origin backend'а всегда в его stateful-списке
 * (Sanctum добавляет `Sanctum::currentApplicationUrlWithPort()` по умолчанию).
 */
export function frontendOriginHeaders(): Record<string, string> {
  const origin = getBackendOrigin();
  return { Origin: origin, Referer: `${origin}/` };
}

/** `GET /sanctum/csrf-cookie` — обязательный первый шаг перед login/logout. */
async function requestCsrfCookieJar(): Promise<CookieJar> {
  const response = await fetch(`${getBackendOrigin()}/sanctum/csrf-cookie`, {
    headers: { Accept: 'application/json', ...frontendOriginHeaders() },
  });

  if (!response.ok) {
    throw new SanctumSessionError('Не удалось получить CSRF-cookie от backend', response.status);
  }

  const jar = parseSetCookiePairs(response.headers);
  if (!jar['XSRF-TOKEN']) {
    throw new SanctumSessionError('Ответ /sanctum/csrf-cookie не содержит XSRF-TOKEN');
  }

  return jar;
}

interface CsrfPostResult {
  response: Response;
  csrfJar: CookieJar;
}

/**
 * Общий CSRF-handshake + `POST` к `test.monetikum.ru`, переиспользуемый и
 * логином (`loginWithCsrf`), и регистрацией спонсора (`verifySponsorPhone`/
 * `registerSponsor`) — все три эндпоинта одинаково требуют свежий XSRF-токен
 * и `Origin`/`Referer` (см. `frontendOriginHeaders()`).
 */
async function postWithCsrf(path: string, body: object): Promise<CsrfPostResult> {
  const csrfJar = await requestCsrfCookieJar();
  const xsrfToken = decodeURIComponent(csrfJar['XSRF-TOKEN']);

  const response = await fetch(`${getBackendApiUrl()}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': xsrfToken,
      Cookie: serializeCookieJar(csrfJar),
      ...frontendOriginHeaders(),
    },
    body: JSON.stringify(body),
  });

  return { response, csrfJar };
}

async function parseErrorBody(response: Response): Promise<{ message?: string; errors?: Record<string, string[]> }> {
  try {
    const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };

    return {
      message: body.message ? translateBackendErrorText(body.message) : body.message,
      errors: body.errors
        ? Object.fromEntries(
          Object.entries(body.errors).map(([field, messages]) => [
            field,
            messages.map(translateBackendErrorText),
          ]),
        )
        : body.errors,
    };
  } catch {
    return {};
  }
}

async function loginWithCsrf(
  path: string,
  body: SponsorLoginCredentials | StudentLoginCredentials,
): Promise<SanctumSession> {
  const { response, csrfJar } = await postWithCsrf(path, body);

  if (!response.ok) {
    throw new SanctumSessionError('Неверные учётные данные', response.status);
  }

  return toSanctumSession(mergeCookieJar(csrfJar, response.headers));
}

/** Логин спонсора — `POST /user/sponsor/login`, тело `{ phone, password }`. */
export function loginSponsor(credentials: SponsorLoginCredentials): Promise<SanctumSession> {
  return loginWithCsrf('/user/sponsor/login', credentials);
}

/** Логин студента — `POST /user/student/login`, тело `{ login, password }`. */
export function loginStudent(credentials: StudentLoginCredentials): Promise<SanctumSession> {
  return loginWithCsrf('/user/student/login', credentials);
}

/**
 * Предвалидирует данные регистрации и отправляет SMS-код —
 * `POST /user/sponsor/verify-phone`. Успех — пустой `204`. Backend требует
 * `password_confirmation` тем же правилом (`confirmed`), что и `register`.
 */
export async function verifySponsorPhone(credentials: SponsorVerifyPhoneCredentials): Promise<void> {
  const { response } = await postWithCsrf('/user/sponsor/verify-phone', {
    name: credentials.name,
    email: credentials.email,
    phone: credentials.phone,
    password: credentials.password,
    password_confirmation: credentials.passwordConfirmation,
  });

  if (response.status === 204) return;

  const body = await parseErrorBody(response);
  throw new SanctumRequestError(body.message ?? SPONSOR_VERIFY_PHONE_FAILED_ERROR, response.status, body.errors);
}

/**
 * Создаёт аккаунт спонсора — `POST /user/sponsor/register`. Успех — `201`.
 * Backend логинит спонсора на своей стороне (`Auth::guard('sponsor')->login()`),
 * но не вызывает `session()->regenerate()`, как это делает `login()` — поэтому
 * вызывающий код не пытается захватить сессию из этого ответа, а выполняет
 * обычный `loginSponsor()`/next-auth `signIn()` сразу после успеха.
 */
export async function registerSponsor(credentials: SponsorRegisterCredentials): Promise<void> {
  const { response } = await postWithCsrf('/user/sponsor/register', {
    name: credentials.name,
    email: credentials.email,
    phone: credentials.phone,
    password: credentials.password,
    password_confirmation: credentials.passwordConfirmation,
    phone_verify_code: credentials.phoneVerifyCode,
    referral_token: credentials.referralToken,
  });

  if (response.status === 201) return;

  const body = await parseErrorBody(response);
  throw new SanctumRequestError(body.message ?? SPONSOR_REGISTER_FAILED_ERROR, response.status, body.errors);
}

/** Инвалидирует Sanctum session-cookie на backend — `POST /user/logout`. */
export async function logoutSanctumSession(session: SanctumSession): Promise<void> {
  const response = await fetch(`${getBackendApiUrl()}/user/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': session.xsrfToken,
      Cookie: session.cookieHeader,
      ...frontendOriginHeaders(),
    },
  });

  if (!response.ok) {
    throw new SanctumSessionError('Не удалось завершить сессию на backend', response.status);
  }
}

/**
 * Достаёт Sanctum cookie/XSRF-токен текущего пользователя из next-auth JWT —
 * напрямую через `getToken()`, а не через `auth()`/`useSession()`. Это
 * намеренно: `session()`-колбэк (`@shared/config/auth`) не прокидывает
 * `sanctumCookie`/`sanctumXsrfToken` наружу (единственное некомпромиссное
 * требование безопасности этой фазы — см. план), поэтому `auth()` не вернёт
 * их ни на сервере, ни тем более на клиенте. `getToken()` расшифровывает JWT
 * напрямую, минуя `session()`, и подходит для доверенного серверного кода,
 * которому реально нужны эти поля: Route Handler-прокси
 * (`src/app/api/backend/[...path]/route.ts`) и `authenticatedServerFetch`.
 *
 * Возвращает `null`, если пользователь не авторизован или в JWT нет
 * Sanctum-полей — вызывающий код сам решает, как на это реагировать.
 */
/**
 * Определяет, нужен ли `__Secure-` префикс у имени next-auth cookie —
 * зеркалит логику самого `@auth/core` (`url.protocol === "https:"`,
 * `x-forwarded-proto` при `trustHost: true`), а не `NODE_ENV`: за прокси без
 * прозрачного `x-forwarded-proto` `NODE_ENV=production` не гарантирует https
 * до самого приложения, и `getToken()` молча искал бы не то имя cookie.
 */
function deriveSecureCookie(req: GetTokenParams['req']): boolean {
  const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers);

  const forwardedProto = headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  if ('url' in req) {
    try {
      return new URL(req.url).protocol === 'https:';
    } catch {
      // req.url не абсолютный/не распознан — используем дефолт ниже.
    }
  }

  return true;
}

export async function resolveSanctumSession(
  req: GetTokenParams['req'],
): Promise<SanctumSession | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new SanctumSessionError('Переменная окружения AUTH_SECRET не задана');
  }

  const token = await getToken({
    req,
    secret,
    secureCookie: deriveSecureCookie(req),
  });

  if (!token?.sanctumCookie || !token.sanctumXsrfToken) {
    return null;
  }

  return { cookieHeader: token.sanctumCookie, xsrfToken: token.sanctumXsrfToken };
}

/**
 * `resolveSanctumSession()` для вызывающих, которым не нужен собственный доступ
 * к заголовкам запроса (Server Actions, `authenticatedServerFetch`) — один
 * choke point для обхода готчи "next/headers vs единый index.ts на слайс"
 * (см. phase-progress.md): `next/headers` импортируется динамически внутри
 * тела функции, а не на верхнем уровне модуля, чтобы не попасть в граф
 * статической достижимости клиентского бандла.
 */
export async function resolveSanctumSessionFromHeaders(): Promise<SanctumSession | null> {
  const { headers } = await import('next/headers');
  const requestHeaders = await headers();
  return resolveSanctumSession({ headers: requestHeaders });
}

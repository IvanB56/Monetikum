import type { NextRequest, NextResponse } from 'next/server';
import { NextRequest as NextRequestImpl } from 'next/server';

import { describe, expect, it, vi } from 'vitest';

import { SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';
import { REFERRAL_TOKEN_COOKIE } from '@shared/lib/referral-token';

import middlewareDefault from './middleware';

// `@shared/config/auth` calls NextAuth(...) at module load — under Vitest's
// Vite-based ESM resolver next-auth's own `next/server` subpath import fails
// to resolve (see authorization-url.test.ts). The mocked `auth` here must be
// an identity wrapper — not a plain vi.fn() — because `middleware.ts` passes
// its request handler through `auth((request) => ...)`; a plain vi.fn() would
// never invoke that handler at all.
vi.mock('next-auth', () => ({
  default: () => ({
    handlers: {},
    auth: (handler: (request: NextRequest) => NextResponse) => (request: NextRequest) => handler(request),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));
vi.mock('next-auth/providers/credentials', () => ({
  default: (config: unknown) => config,
}));

// Реальный тип `auth((request) => ...)` в next-auth v5 — сложная объединённая
// сигнатура (`Promise<Response>`, опциональный `event`), не отражающая то, как
// мы синхронно подменяем `auth` в моке выше. Приведение типа локально для теста.
const middleware = middlewareDefault as unknown as (request: NextRequest) => NextResponse;

interface AuthOverride {
  user: { role: typeof SPONSOR_ROLE | typeof STUDENT_ROLE };
}

function createRequest(url: string, auth?: AuthOverride): NextRequest {
  const request = new NextRequestImpl(new URL(url, 'https://monetikum.ru'));
  if (auth) {
    Object.assign(request, { auth });
  }
  return request;
}

describe('middleware — role-based редиректы', () => {
  it('редиректит неавторизованного пользователя с защищённого пути на /authorization', () => {
    const response = middleware(createRequest('/sponsor'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://monetikum.ru/authorization');
  });

  it('не редиректит неавторизованного пользователя с публичного пути', () => {
    const response = middleware(createRequest('/'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('редиректит спонсора вне /sponsor на /sponsor/start', () => {
    const response = middleware(createRequest('/', { user: { role: SPONSOR_ROLE } }));

    expect(response.headers.get('location')).toBe('https://monetikum.ru/sponsor/start');
  });

  it('не редиректит спонсора внутри /sponsor', () => {
    const response = middleware(createRequest('/sponsor/start', { user: { role: SPONSOR_ROLE } }));

    expect(response.headers.get('location')).toBeNull();
  });

  it('редиректит студента вне /student на /student/start', () => {
    const response = middleware(createRequest('/', { user: { role: STUDENT_ROLE } }));

    expect(response.headers.get('location')).toBe('https://monetikum.ru/student/start');
  });

  it('не редиректит студента внутри /student', () => {
    const response = middleware(createRequest('/student/start', { user: { role: STUDENT_ROLE } }));

    expect(response.headers.get('location')).toBeNull();
  });
});

describe('middleware — реферальный токен', () => {
  it('сохраняет referral_token в cookie на обычном ответе', () => {
    const response = middleware(createRequest('/?r=abc123'));

    expect(response.cookies.get(REFERRAL_TOKEN_COOKIE)?.value).toBe('abc123');
  });

  it('сохраняет referral_token в cookie даже когда ответ — редирект', () => {
    const response = middleware(createRequest('/sponsor?r=abc123'));

    expect(response.headers.get('location')).toBe('https://monetikum.ru/authorization');
    expect(response.cookies.get(REFERRAL_TOKEN_COOKIE)?.value).toBe('abc123');
  });

  it('не устанавливает cookie, если параметра r нет в URL', () => {
    const response = middleware(createRequest('/'));

    expect(response.cookies.get(REFERRAL_TOKEN_COOKIE)).toBeUndefined();
  });
});

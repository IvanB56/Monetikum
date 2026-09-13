import { describe, expect, it, vi } from 'vitest';

import { SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';

import {
  buildAuthorizationHref,
  buildAuthorizationSearch,
  parseMode,
  parseRole,
} from './authorization-url';

// `@shared/config/auth` calls NextAuth(...) at module load — under Vitest's
// Vite-based ESM resolver (unlike Next.js's webpack build) next-auth's own
// `next/server` subpath import fails to resolve without an `exports` field
// on Next.js's package.json (see the `@ts-expect-error` comment in
// next-auth/lib/env.js). Mocked here purely to satisfy that import chain —
// SPONSOR_ROLE/STUDENT_ROLE/UserRole themselves are plain constants.
vi.mock('next-auth', () => ({
  default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }),
}));
vi.mock('next-auth/providers/credentials', () => ({
  default: (config: unknown) => config,
}));

describe('parseRole', () => {
  it('возвращает null, если параметр role отсутствует', () => {
    expect(parseRole(new URLSearchParams())).toBeNull();
  });

  it('возвращает null для неизвестного значения role', () => {
    expect(parseRole(new URLSearchParams('role=admin'))).toBeNull();
  });

  it('распознаёт SPONSOR_ROLE', () => {
    expect(parseRole(new URLSearchParams(`role=${SPONSOR_ROLE}`))).toBe(SPONSOR_ROLE);
  });

  it('распознаёт STUDENT_ROLE', () => {
    expect(parseRole(new URLSearchParams(`role=${STUDENT_ROLE}`))).toBe(STUDENT_ROLE);
  });
});

describe('parseMode', () => {
  it('возвращает login, если роль не выбрана, даже при mode=register в URL', () => {
    expect(parseMode(new URLSearchParams('mode=register'), null)).toBe('login');
  });

  it('возвращает login для роли студента, даже при mode=register в URL', () => {
    expect(parseMode(new URLSearchParams('mode=register'), STUDENT_ROLE)).toBe('login');
  });

  it('возвращает login для роли спонсора без mode в URL', () => {
    expect(parseMode(new URLSearchParams(), SPONSOR_ROLE)).toBe('login');
  });

  it('возвращает register только для роли спонсора с mode=register в URL', () => {
    expect(parseMode(new URLSearchParams('mode=register'), SPONSOR_ROLE)).toBe('register');
  });
});

describe('buildAuthorizationSearch', () => {
  it('не пишет ни role, ни mode, если роль не выбрана', () => {
    expect(buildAuthorizationSearch(null, 'login').toString()).toBe('');
  });

  it('пишет только role для студента', () => {
    expect(buildAuthorizationSearch(STUDENT_ROLE, 'login').toString()).toBe(`role=${STUDENT_ROLE}`);
  });

  it('опускает mode=register для студента', () => {
    expect(buildAuthorizationSearch(STUDENT_ROLE, 'register').toString()).toBe(`role=${STUDENT_ROLE}`);
  });

  it('пишет role и mode для спонсора в режиме регистрации', () => {
    expect(buildAuthorizationSearch(SPONSOR_ROLE, 'register').toString()).toBe(
      `role=${SPONSOR_ROLE}&mode=register`,
    );
  });
});

describe('buildAuthorizationHref', () => {
  it('возвращает путь без query, если роль не выбрана', () => {
    expect(buildAuthorizationHref(null, 'login')).toBe('/authorization');
  });

  it('возвращает путь с role и mode для регистрации спонсора', () => {
    expect(buildAuthorizationHref(SPONSOR_ROLE, 'register')).toBe('/authorization?role=Sponsor&mode=register');
  });

  it('возвращает путь только с role для логина студента', () => {
    expect(buildAuthorizationHref(STUDENT_ROLE, 'login')).toBe('/authorization?role=Student');
  });
});

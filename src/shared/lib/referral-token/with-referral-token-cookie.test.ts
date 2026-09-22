import { NextRequest, NextResponse } from 'next/server';

import { describe, expect, it } from 'vitest';

import { REFERRAL_TOKEN_COOKIE, REFERRAL_TOKEN_MAX_AGE_SECONDS } from './referral-token-constants';
import { withReferralTokenCookie } from './with-referral-token-cookie';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'https://monetikum.ru'));
}

describe('withReferralTokenCookie', () => {
  it('устанавливает cookie referral_token, если в URL есть параметр r', () => {
    const request = createRequest('/?r=abc123');
    const response = withReferralTokenCookie(request, NextResponse.next());

    const cookie = response.cookies.get(REFERRAL_TOKEN_COOKIE);
    expect(cookie?.value).toBe('abc123');
  });

  it('ставит cookie с ожидаемыми атрибутами (SameSite=Lax, Path=/, не httpOnly, с maxAge)', () => {
    const request = createRequest('/?r=abc123');
    const response = withReferralTokenCookie(request, NextResponse.next());

    const setCookieHeader = response.headers.get('set-cookie') ?? '';
    expect(setCookieHeader).toContain('SameSite=lax');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).not.toContain('HttpOnly');
    expect(setCookieHeader).toContain(`Max-Age=${REFERRAL_TOKEN_MAX_AGE_SECONDS}`);
  });

  it('не устанавливает cookie, если параметр r отсутствует в URL', () => {
    const request = createRequest('/sponsor/start');
    const response = withReferralTokenCookie(request, NextResponse.next());

    expect(response.cookies.get(REFERRAL_TOKEN_COOKIE)).toBeUndefined();
  });

  it('возвращает переданный response как есть, когда токена нет', () => {
    const request = createRequest('/sponsor/start');
    const originalResponse = NextResponse.next();

    expect(withReferralTokenCookie(request, originalResponse)).toBe(originalResponse);
  });

  it('устанавливает cookie и на response-редиректе, а не только на "happy path"', () => {
    const request = createRequest('/sponsor?r=abc123');
    const redirect = NextResponse.redirect(new URL('/authorization', 'https://monetikum.ru'));

    const response = withReferralTokenCookie(request, redirect);

    expect(response.cookies.get(REFERRAL_TOKEN_COOKIE)?.value).toBe('abc123');
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import { getReferralToken } from './get-referral-token';
import { REFERRAL_TOKEN_COOKIE } from './referral-token-constants';

function clearAllCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (name) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  });
}

describe('getReferralToken', () => {
  afterEach(() => {
    clearAllCookies();
  });

  it('возвращает null, если cookie referral_token отсутствует', () => {
    expect(getReferralToken()).toBeNull();
  });

  it('возвращает значение cookie referral_token', () => {
    document.cookie = `${REFERRAL_TOKEN_COOKIE}=abc123; path=/`;
    expect(getReferralToken()).toBe('abc123');
  });

  it('декодирует URL-закодированное значение', () => {
    document.cookie = `${REFERRAL_TOKEN_COOKIE}=${encodeURIComponent('abc 123')}; path=/`;
    expect(getReferralToken()).toBe('abc 123');
  });

  it('находит referral_token среди нескольких cookie', () => {
    document.cookie = 'other=value; path=/';
    document.cookie = `${REFERRAL_TOKEN_COOKIE}=abc123; path=/`;
    document.cookie = 'another=value2; path=/';

    expect(getReferralToken()).toBe('abc123');
  });
});

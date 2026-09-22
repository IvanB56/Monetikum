import { REFERRAL_TOKEN_COOKIE } from './referral-token-constants';

/** Читает cookie реферального токена — только для клиентского кода (`document.cookie`). */
export function getReferralToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${REFERRAL_TOKEN_COOKIE}=`));

  if (!match) {
    return null;
  }

  const value = match.slice(REFERRAL_TOKEN_COOKIE.length + 1);
  return value ? decodeURIComponent(value) : null;
}

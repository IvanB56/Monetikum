import { REFERRAL_TOKEN_COOKIE } from './referral-token-constants';

/** Затирает cookie реферального токена после успешной регистрации спонсора. */
export function clearReferralToken(): void {
  document.cookie = `${REFERRAL_TOKEN_COOKIE}=; Max-Age=0; path=/`;
}

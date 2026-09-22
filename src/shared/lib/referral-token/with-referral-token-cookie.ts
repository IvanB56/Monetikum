import type { NextRequest, NextResponse } from 'next/server';

import {
  REFERRAL_TOKEN_COOKIE,
  REFERRAL_TOKEN_MAX_AGE_SECONDS,
  REFERRAL_TOKEN_PARAM,
} from './referral-token-constants';

/**
 * Захватывает `?r=<token>` из URL и кладёт его в cookie с ограниченным сроком
 * жизни — вызывается из `middleware.ts` на каждом ответе (в т.ч. редиректах),
 * чтобы атрибуция реферала не терялась, если пользователь заходит на защищённый
 * путь или переходит между guest-страницами до момента регистрации.
 *
 * Если `?r=` в текущем запросе нет — уже сохранённая cookie не трогается,
 * повторный визит без параметра не должен затирать более раннюю атрибуцию.
 */
export function withReferralTokenCookie(request: NextRequest, response: NextResponse): NextResponse {
  const token = request.nextUrl.searchParams.get(REFERRAL_TOKEN_PARAM);
  if (!token) {
    return response;
  }

  response.cookies.set(REFERRAL_TOKEN_COOKIE, token, {
    sameSite: 'lax',
    path: '/',
    httpOnly: false,
    secure: true,
    maxAge: REFERRAL_TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}

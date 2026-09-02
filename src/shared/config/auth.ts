import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import {
  loginSponsor,
  loginStudent,
  SanctumSessionError,
} from '@shared/api';

export const SPONSOR_ROLE = 'SPONSOR';
export const STUDENT_ROLE = 'STUDENT';

export type UserRole = typeof SPONSOR_ROLE | typeof STUDENT_ROLE;

/**
 * BFF-мост авторизации: `authorize()` сам ходит на Sanctum stateful-backend
 * `test.monetikum.ru` (см. `@shared/api/sanctum-session`) и кладёт захваченные
 * cookie/XSRF-токен внутрь зашифрованной next-auth JWT — `session()` их наружу
 * не отдаёт, см. `@shared/types/next-auth.d.ts`.
 *
 * Регистрация ребёнка/спонсора, прокси авторизованных запросов и роутинг —
 * следующие под-фазы (1.1–1.4), здесь только сам механизм входа.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  // Next.js-сервер этого приложения не хостится на Vercel — без этого флага
  // next-auth v5 отклоняет запросы с ошибкой UntrustedHost.
  trustHost: true,
  providers: [
    Credentials({
      id: 'sponsor',
      name: 'Спонсор',
      credentials: {
        phone: { label: 'Телефон', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const { phone, password } = credentials;
        if (typeof phone !== 'string' || typeof password !== 'string') {
          return null;
        }

        try {
          const session = await loginSponsor({ phone, password });
          return {
            id: phone,
            role: SPONSOR_ROLE,
            sanctumCookie: session.cookieHeader,
            sanctumXsrfToken: session.xsrfToken,
          };
        } catch (error) {
          if (error instanceof SanctumSessionError) return null;
          throw error;
        }
      },
    }),
    Credentials({
      id: 'student',
      name: 'Студент',
      credentials: {
        login: { label: 'Логин', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const { login, password } = credentials;
        if (typeof login !== 'string' || typeof password !== 'string') {
          return null;
        }

        try {
          const session = await loginStudent({ login, password });
          return {
            id: login,
            role: STUDENT_ROLE,
            sanctumCookie: session.cookieHeader,
            sanctumXsrfToken: session.xsrfToken,
          };
        } catch (error) {
          if (error instanceof SanctumSessionError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sanctumCookie = user.sanctumCookie;
        token.sanctumXsrfToken = user.sanctumXsrfToken;
      }
      return token;
    },
    session({ session, token }) {
      // Намеренно не копируем token.sanctumCookie/sanctumXsrfToken сюда —
      // это единственное некомпромиссное требование безопасности этой фазы,
      // session() отдаётся клиенту через useSession()/auth(). token.role
      // всегда выставлен jwt()-колбэком выше при первом входе и переживает
      // все последующие вызовы, поэтому здесь он гарантированно есть.
      session.user.role = token.role as UserRole;
      return session;
    },
  },
});

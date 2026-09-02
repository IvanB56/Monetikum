import type { DefaultSession } from 'next-auth';

import type { UserRole } from '@shared/config/auth';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    /** Готовый заголовок `Cookie` Sanctum-сессии — только для серверных callback'ов, не для клиента. */
    sanctumCookie?: string;
    /** Значение XSRF-TOKEN для заголовка `X-XSRF-TOKEN` — только для серверных callback'ов. */
    sanctumXsrfToken?: string;
  }

  interface Session {
    user: DefaultSession['user'] & {
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    /** Живёт только в зашифрованной JWT — `session()` не должен прокидывать это клиенту. */
    sanctumCookie?: string;
    sanctumXsrfToken?: string;
  }
}

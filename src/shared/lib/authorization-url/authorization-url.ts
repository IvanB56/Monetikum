import type { UserRole } from '@shared/config/auth';
import { SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';

export const AUTHORIZATION_PATH = '/authorization';

export const ROLE_PARAM = 'role';
export const MODE_PARAM = 'mode';

export type AuthMode = 'login' | 'register';

export function isUserRole(value: string): value is UserRole {
  return value === SPONSOR_ROLE || value === STUDENT_ROLE;
}

export function isAuthMode(value: string): value is AuthMode {
  return value === 'login' || value === 'register';
}

export function parseRole(searchParams: URLSearchParams): UserRole | null {
  const role = searchParams.get(ROLE_PARAM);
  return role !== null && isUserRole(role) ? role : null;
}

export function parseMode(searchParams: URLSearchParams, role: UserRole | null): AuthMode {
  if (role === SPONSOR_ROLE && searchParams.get(MODE_PARAM) === 'register') {
    return 'register';
  }
  return 'login';
}

export function buildAuthorizationSearch(role: UserRole | null, mode: AuthMode): URLSearchParams {
  const search = new URLSearchParams();
  if (role !== null) {
    search.set(ROLE_PARAM, role);
  }
  if (mode === 'register' && role === SPONSOR_ROLE) {
    search.set(MODE_PARAM, mode);
  }
  return search;
}

export function buildAuthorizationHref(role: UserRole | null, mode: AuthMode): string {
  const search = buildAuthorizationSearch(role, mode).toString();
  return search ? `${AUTHORIZATION_PATH}?${search}` : AUTHORIZATION_PATH;
}

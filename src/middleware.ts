import { NextResponse } from 'next/server';

import { auth, SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';

const PROTECTED_PATH_PREFIXES = [ '/student', '/sponsor', '/settings' ];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user.role;

  const isProtectedPath = PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!request.auth && isProtectedPath) {
    return NextResponse.redirect(new URL('/?login=true', request.nextUrl));
  }

  if (role === SPONSOR_ROLE && !pathname.startsWith('/sponsor')) {
    return NextResponse.redirect(new URL('/sponsor/start', request.nextUrl));
  }

  if (role === STUDENT_ROLE && !pathname.startsWith('/student')) {
    return NextResponse.redirect(new URL('/student/start', request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [ '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' ],
};

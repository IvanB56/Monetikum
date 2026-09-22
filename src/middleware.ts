import { NextResponse } from 'next/server';

import { auth, SPONSOR_ROLE, STUDENT_ROLE } from '@shared/config/auth';
import { withReferralTokenCookie } from '@shared/lib/referral-token';

const PROTECTED_PATH_PREFIXES = [ '/student', '/sponsor', '/settings' ];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user.role;

  const isProtectedPath = PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  let response: NextResponse;

  if (!request.auth && isProtectedPath) {
    response = NextResponse.redirect(new URL('/authorization', request.nextUrl));
  } else if (role === SPONSOR_ROLE && !pathname.startsWith('/sponsor')) {
    response = NextResponse.redirect(new URL('/sponsor/start', request.nextUrl));
  } else if (role === STUDENT_ROLE && !pathname.startsWith('/student')) {
    response = NextResponse.redirect(new URL('/student/start', request.nextUrl));
  } else {
    response = NextResponse.next();
  }

  return withReferralTokenCookie(request, response);
});

export const config = {
  matcher: [ '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' ],
};

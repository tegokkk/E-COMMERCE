import { NextResponse } from 'next/server';

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  if (pathname !== '/admin/login' && !request.cookies.has('konter_sid')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: '/admin/:path*',
};

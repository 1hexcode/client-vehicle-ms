import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

  const { pathname } = request.nextUrl;

  // 1. If trying to access protected routes without token
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname.startsWith('/customer'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. If logged in and trying to access auth pages
  if (token && pathname.startsWith('/auth')) {
    if (user?.role === 'Admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (user?.role === 'Staff') return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    return NextResponse.redirect(new URL('/customer/dashboard', request.url));
  }

  // 3. Role-based unauthorized access prevention
  if (token) {
    if (pathname.startsWith('/admin') && user?.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/staff') && user?.role !== 'Staff') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/customer') && user?.role !== 'Customer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/customer/:path*', '/auth/:path*'],
};

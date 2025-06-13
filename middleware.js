import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // ตรวจสอบเฉพาะ admin routes
  if (pathname.startsWith('/admin')) {
    // ยกเว้น login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    try {
      // ตรวจสอบ token จาก localStorage ผ่าน cookie
      const token = request.cookies.get('adminToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // ตรวจสอบ JWT token
      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
      await jwtVerify(token, secret);

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
}; 
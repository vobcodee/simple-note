import { NextResponse, type NextRequest } from 'next/server';

console.log('[MIDDLEWARE] Module loaded');

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request:', request.url);
  
  // Check for auth cookie
  const cookies = request.cookies.getAll();
  const authCookie = cookies.find(c => 
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );
  
  const hasAuthCookie = !!authCookie?.value;
  console.log('[MIDDLEWARE] Has auth cookie:', hasAuthCookie);
  
  // For now, we just check if auth cookie exists
  // JWT validation happens in server actions using @supabase/ssr
  
  // Protected routes - redirect to login if no auth cookie
  if (request.nextUrl.pathname.startsWith('/notes') && !hasAuthCookie) {
    console.log('[MIDDLEWARE] No auth cookie, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && hasAuthCookie) {
    console.log('[MIDDLEWARE] Has auth cookie, redirecting to notes');
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  console.log('[MIDDLEWARE] Proceeding');
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
